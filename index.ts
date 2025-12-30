import fs from "fs";
import readline from "readline";

const LOG_FILE = "/var/log/nginx/access_analytics.log";

const regex =
	/ip=(\S+).*time="([^"]+)".*status=(\d+).*ua="([^"]+)".*country=(\S+)/;

const store = new Map();

const rl = readline.createInterface({
	input: fs.createReadStream(LOG_FILE),
	crlfDelay: Infinity,
});

rl.on("line", (line) => {
	const match = line.match(regex);
	if (!match) return;

	const [, ip, time, status, ua, country] = match;

	const key = `${ip}|${country}|${status}|${ua}`;

	if (!store.has(key)) {
		store.set(key, {
			ip,
			country,
			status: Number(status),
			userAgent: ua,
			firstSeen: time,
			count: 1,
		});
	} else {
		store.get(key).count++;
	}
});

rl.on("close", () => {
	for (const record of store.values()) {
		console.log(record);
	}
});
