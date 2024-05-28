const http = require("http");
const fs = require("fs");
const path = require("path");

const server = http.createServer();

server.on("request", async (req,res) => {
    console.log(req.url);
	let file, contentType = "text/javascript";

  if (req.url === "/") {
    try {
     file = fs.readFileSync(__dirname + "/src/pages/index.html");
    } catch (err) {
     console.log(err);
    }

     res.setHeader("Content-Type", "text/html");
     res.statusCode = 200;
     res.end(file);
 
     return; 
  }

switch (path.extname(req.url)) {
	case ".js": contentType = "text/javascript";
	break;
	case ".html": contentType = "text/html";  
	break;
	case ".css": contentType = "text/css";
	break;
	case ".png": contentType = "image/png";
	break;
	case ".jpeg": contentType = "image/jpeg";
	break
	case ".jpg": contentType = "image/jpg";
	break;
        case ".ico": contentType = "image/png";
        break;
        case ".wav": contentType = "audio/wav";
        break; 
        default: contentType = "text/javascript"; 
	}

try {
file = await fs.readFileSync(path.resolve("./"+req.url));
} catch (err) {
file = false;
}

if (file) {
if (contentType) res.setHeader("Content-Type",contentType);	
res.writeHead(200);
res.end(file);
} else {
 console.log("not found");
res.writeHead(404,{});
res.end();
}
});

server.listen(process.env.PORT,() => {
console.log("listening...");
});
