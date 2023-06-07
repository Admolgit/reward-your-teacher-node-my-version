const mongoose = require("mongoose");
const moment = require("moment-timezone");
const httpStatus = require("http-status");
const jwt = require("jwt-simple");
const { omitBy, isNil } = require("lodash");
const bcrypt = require("bcryptjs");
const uuidv4 = require("uuid");
const { env, jwtSecret, jwtExpirationInterval } = require("../../config/vars");
const APIError = require("../errors/api-error");

const roles = ["user", "teacher"];
const teacherSchema = new mongoose.Schema(
  {
    fullName: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    school: { type: String, required: true },
    position: { type: String },
    startYear: { type: Number, required: true },
    endYear: { type: Number, required: true },
    balance: { type: Number, default: 0 },
    virtual_account_id: String,
    services: {
      facebook: String,
      google: String,
    },
    roleId: {
      type: String,
      enum: ["old_student", "teacher"],
      default: "teacher",
    },
  },
  { timestamps: true }
);
// methods
/**
 * Add your
 * - pre-save hooks
 * - validations
 * - virtuals
 */
teacherSchema.pre("save", async function save(next) {
  try {
    if (!this.isModified("password")) return next();
    const rounds = env === "test" ? 1 : 10;
    const hash = await bcrypt.hash(this.password, rounds);
    this.password = hash;
    return next();
  } catch (error) {
    return next(error);
  }
});
/**
 * Methods
 */
teacherSchema.method({
  transform() {
    const transformed = {};
    const fields = [
      "id",
      "fullName",
      "email",
      "position",
      "school",
      "startYear",
      "endYear",
      "virtual_account_id",
    ];
    fields.forEach((field) => {
      transformed[field] = this[field];
    });
    return transformed;
  },
  token() {
    const payload = {
      exp: moment().add(jwtExpirationInterval, "minutes").unix(),
      iat: moment().unix(),
      sub: this._id,
    };
    return jwt.encode(payload, jwtSecret);
  },
  async passwordMatches(password) {
    return bcrypt.compare(password, this.password);
  },
  decode(token) {
    return jwt.decode(token, jwtSecret);
  },
});
/**
 * Statics
 */
teacherSchema.statics = {
  roles,
  /**
   * Get user
   *
   * @param {ObjectId} id - The objectId of user.
   * @returns {Promise<User, APIError>}
   */
  async get(id) {
    let teacher;
    if (mongoose.Types.ObjectId.isValid(id)) {
      teacher = await this.findById(id).exec();
    }
    if (teacher) {
      return teacher;
    }
    throw new APIError({
      message: "User does not exist",
      status: httpStatus.NOT_FOUND,
    });
  },
  /**
   * Find user by email and tries to generate a JWT token
   *
   * @param {ObjectId} id - The objectId of user.
   * @returns {Promise<User, APIError>}
   */
  async findAndGenerateToken(options) {
    const { email, password, refreshObject } = options;
    if (!email)
      throw new APIError({
        message: "An email is required to generate a token",
      });
    const teacher = await this.findOne({ email }).exec();
    const err = {
      status: httpStatus.UNAUTHORIZED,
      isPublic: true,
    };
    if (password) {
      if (teacher && (await teacher.passwordMatches(password))) {
        return { teacher, accessToken: teacher.token() };
      }
      err.message = "Incorrect email or password";
      err.status = httpStatus.BAD_REQUEST;
    } else if (refreshObject && refreshObject.userEmail === email) {
      if (moment(refreshObject.expires).isBefore()) {
        err.message = "Invalid refresh token.";
      } else {
        return { teacher, accessToken: teacher.token() };
      }
    } else {
      err.message = "Incorrect email or refreshToken";
    }
    throw new APIError(err);
  },
  /**
   * List users in descending order of 'createdAt' timestamp.
   *
   * @param {number} skip - Number of users to be skipped.
   * @param {number} limit - Limit number of users to be returned.
   * @returns {Promise<User[]>}
   */
  list({ page = 1, perPage = 12, name, email, position, fullName, school }) {
    const options = omitBy(
      {
        name,
        email,
        position,
        fullName,
        school,
      },
      isNil
    );
    return this.find(options)
      .sort({ createdAt: -1 })
      .skip(Number(perPage) * (Number(page) - 1))
      .limit(Number(perPage))
      .exec();
  },
  /**
   * Return new validation error
   * if error is a mongoose duplicate key error
   *
   * @param {Error} error
   * @returns {Error|APIError}
   */
  checkDuplicateEmail(error) {
    if (error.name === "MongoError" && error.code === 11000) {
      return new APIError({
        message: "Validation Error",
        errors: [
          {
            field: "email",
            location: "body",
            messages: ['"email" already exists'],
          },
        ],
        status: httpStatus.CONFLICT,
        isPublic: true,
        stack: error.stack,
      });
    }
    return error;
  },
  async oAuthLogin({ service, id, email, name, picture }) {
    const teacher = await this.findOne({
      $or: [{ [`services.${service}`]: id }, { email }],
    });
    if (teacher) {
      teacher.services[service] = id;
      if (!teacher.name) teacher.name = name;
      if (!teacher.picture) teacher.picture = picture;
      return teacher.save();
    }
    const password = uuidv4();
    return this.create({
      services: { [service]: id },
      email,
      password,
      name,
      picture,
    });
  },
};
/**
 * @typedef Teacher
 */
module.exports =
  mongoose.models.Teacher || mongoose.model("Teacher", teacherSchema);
