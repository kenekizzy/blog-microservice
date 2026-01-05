import Joi from "joi";

const validateRegistration = (data) => {
    const schema = Joi.object({
        username: Joi.string().min(3).required(),
        firstName: Joi.string().required(),
        lastName: Joi.string().required(),
        email: Joi.string().required(),
        password: Joi.string().min(6).required(),
        phoneNumber: Joi.string().required(),
    });

    return schema.validate(data);
}

const validateLogin = (data) => {
    const schema = Joi.object({
        email: Joi.string().required(),
        password: Joi.string().min(6).required(),
    });

    return schema.validate(data);
}

export { validateRegistration, validateLogin }