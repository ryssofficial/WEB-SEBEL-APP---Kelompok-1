import express from 'express';
import { AuthToken } from './AuthToken.js';

export default class BaseRoutes {
    #method;
    #route;
    #handler;
    #expressRouter;

    /**
     * @param {string} method - "get" | "post" | "put" | "delete"
     * @param {string} route - Path url, contoh: "/login"
     * @param {Function} handler - Controller / Middleware penangan rute
     * @param {Object} expressRouter - Instance router dari Express luar
     */
    constructor(method, route, handler, expressRouter) {
        this.#method = method.toLowerCase();
        this.#route = route;
        this.#handler = handler;
        this.#expressRouter = expressRouter;

        return (router) => { return this.#execute(router); };
    }

    /**
     * Mengeksekusi pendaftaran rute ke router Express
     * @param {Object} router - Instance router dari Express luar
     */
    #execute(router) {
        const isPublicRoute = this.#route.includes('/login') || this.#route.includes('/register');

        switch (this.#method) {
            case "post": 
                if (isPublicRoute) {
                    return router.post(this.#route, this.#handler);
                } else {
                    return router.post(this.#route, AuthToken, this.#handler);
                }
            
            case "get": 
                if (isPublicRoute) {
                    return router.get(this.#route, this.#handler);
                } else {
                    return router.get(this.#route, AuthToken, this.#handler);
                }
                
            case "put": 
                if (isPublicRoute) {
                    return router.put(this.#route, this.#handler);
                } else {
                    return router.put(this.#route, AuthToken, this.#handler);
                }
                
            case "delete": 
                if (isPublicRoute) {
                    return router.delete(this.#route, this.#handler);
                } else {
                    return router.delete(this.#route, AuthToken, this.#handler);
                }
                
            default: 
                throw new Error(`Tolak Akses Method HTTP: [${this.#method}].`);
        }
    }

    /**
     * Method static pembantu pembentukan rute cepat
     */
    static generate(method, route, handler) { 
        return new BaseRoutes(method, route, handler); 
    }
}