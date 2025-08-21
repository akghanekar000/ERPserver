import http from "http";
const s = http.createServer((req, res) => res.end("ok"));
s.listen(3000, () => console.log("tiny server running on 3000"));