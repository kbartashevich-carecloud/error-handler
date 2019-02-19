'use strict';
const _ = require('lodash');

//base parent class for other handlers.

class ErrorHandler {
    constructor(error = {}, settings = {}) {
        this.response = error.response || error;
        this.customResponse = this.processErrorMessages(this.response, settings);
    }

    processErrorMessages(response, settings) {
        let respErrors = this.buildResponse(response, settings);

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

        message = _.get(respPayload, 'message', 'INTERNAL_SERVER_ERROR');
        statusCode = _.get(respPayload, 'status', 500);
        requestId = _.get(respPayload, 'reqId', 'Not defined');
        env = _.get(respPayload, 'env', 'production');

        result = {message: message,
            code: statusCode,
            reqId: requestId};

        if(env.toLowerCase() !== 'production') {
            method = _.get(respPayload, 'method', 'POST');
            endpoint = _.get(respPayload, 'endpoint', 'HTTP or GraphQl call');

            result.method = method;
            result.endpoint = endpoint;

            if(Object.keys(settings).length !== 0) {
                for(let prop of Object.keys(settings)) {
                    if(prop !== "env") {
                        result[prop] = settings[prop];
                    }
                }
            }
        }

        return result;
    }

    send() {
        return this.customResponse;
    }
}

module.exports = ErrorHandler;


