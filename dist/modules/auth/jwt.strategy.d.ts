import { Strategy } from 'passport-jwt';
import type { JwtUser } from './auth.types';
type JwtPayload = {
    sub: string;
    role: JwtUser['role'];
    email: string | null;
    branchId?: string | null;
};
declare const JwtStrategy_base: new (...args: [opt: import("passport-jwt").StrategyOptionsWithRequest] | [opt: import("passport-jwt").StrategyOptionsWithoutRequest]) => Strategy & {
    validate(...args: any[]): unknown;
};
export declare class JwtStrategy extends JwtStrategy_base {
    constructor();
    validate(payload: JwtPayload): JwtUser;
}
export {};
