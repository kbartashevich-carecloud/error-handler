'use strict';
const _ = require('lodash');
const Errorhandler = require('./base-handler');

//class for creating errors with custom composition.

class ExpressErrorHandler extends Errorhandler {
    constructor(error, settings) {
        super(error, settings);
    }

    processErrorMessages(response, settings) {
        let respErrors;

        if(response.errors && Array.isArray(response.errors)) {
            respErrors = [];

            for(let error of response.errors) {
                let resError = this.buildResponse(error, settings);
                respErrors.push(resError);
            }
        } else {
            respErrors = this.buildResponse(this.response, settings);
        }

        return respErrors;
    }


    buildResponse(response, settings) {
        let message,
            statusCode,
            endpoint,
            method,
            requestId,
            env,
            result;

        let respPayload = _.assign(response, settings);

        message = _.get(respPayload, 'message') || (_.get(respPayload, 'statusText', 'INTERNAL_SERVER_ERROR'));
        statusCode = _.get(respPayload, 'status', 500);
        requestId = _.get(respPayload, 'reqId') || (_.get(respPayload, 'config', false) ? _.get(respPayload, 'config.headers["cc-request-id"]') : 'Not defined');
        env = _.get(respPayload, 'env', 'production');

        result = {message: message,
            code: statusCode,
            reqId: requestId};

        if(env.toLowerCase() !== 'production') {
            method = (_.get(respPayload, 'method')) || (_.get(respPayload, 'request.method', 'POST'));
            endpoint = (_.get(respPayload, 'endpoint')) || (_.get(respPayload, 'config.url', 'HTTP or GraphQl call'));

            result.method = method;
            result.endpoint = endpoint;
            result = _.assign(result, settings, { "env": null });
        }

        return result;
    }

    send(res) {

        const  code  = this.customResponse.code || this.customResponse[0].code;
        return res.status(code).json(this.customResponse).end();
    }
}

//main function for sending errors.

function sendError(error, res, settings = {}) {
    return new ExpressErrorHandler(error, settings).send(res);
}

module.exports = sendError;


