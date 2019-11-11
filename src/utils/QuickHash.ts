const Hash = require("crypto").Hash;

export function quickHash(data:string):string {
	let hash = new Hash("md5");
	hash.update(data);
	return hash.digest("hex").toString();
}