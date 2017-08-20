import * as uuid from "uuid/v4";
import * as url from "url";

export class Utils {
    /**
     * Random generators
     */

    public static generateRandomId(): String {
        return uuid();
    }

    public static generateRandomIPAddress(): string {
        return `${Utils.generateRandomNumberAsString(128)}.${Utils.generateRandomNumberAsString(128)}.` +
            `${Utils.generateRandomNumberAsString(128)}.${Utils.generateRandomNumberAsString(128)}`;
    }

    public static generateRandomPort(from: number = 0, to: number = 65535): number {
        return Math.trunc(from + Math.random() * (to - from));
    }

    public static generateRandomUrl(from: number = 0, to: number = 65535): url.Url {
        return url.parse(`http://${Utils.generateRandomIPAddress()}:${Utils.generateRandomPort(from, to)}`);
    }

    private static generateRandomNumberAsString(upTo: number): string {
        let num: number = Math.trunc(Math.random() * upTo);
        return num.toString();
    }
}
