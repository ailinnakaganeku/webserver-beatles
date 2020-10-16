var http = require("http");
var fs = require("fs");
//fs: leer o escribir archivos que están
//en tu computadora.
 const port = 3000;


var beatles = [
  {
    name: "John Lennon",
    birthdate: "09/10/1940",
    profilePic: "https://upload.wikimedia.org/wikipedia/commons/thumb/a/a0/John_Lennon_1969_%28cropped%29-Colorized.jpg/800px-John_Lennon_1969_%28cropped%29-Colorized.jpg",
  },
  {
    name: "Paul McCartney",
    birthdate: "18/06/1942",
    profilePic:
      "http://gazettereview.com/wp-content/uploads/2016/06/paul-mccartney.jpg",
  },
  {
    name: "George Harrison",
    birthdate: "25/02/1946",
    profilePic:
      "https://upload.wikimedia.org/wikipedia/commons/thumb/4/42/George_Harrison_1974.jpg/220px-George_Harrison_1974.jpg",
  },
  {
    name: "Richard Starkey",
    birthdate: "07/08/1940",
    profilePic:
      "http://cp91279.biography.com/BIO_Bio-Shorts_0_Ringo-Starr_SF_HD_768x432-16x9.jpg",
  },
];




//Codificación 'utf-8' --> Template --> para formatear tipo texto
//promisificar el readFile.
//función para saber ---> cómo leo el archivo y dónde guardo la promesa 
var readFile = function (file) {
  return new Promise(function (resolve, reject) {
    fs.readFile(file, "utf-8", function (err, data) {
      if (err) return reject(err);
      resolve(data);
    })
  });
};

//Levanto los archivos index.html y beatle.html
//ahora en cualquier parte de mi servidor puedo acceder a profile y home
const profile = readFile("./beatle.html");
const home = readFile("./index.html");

//parseo el html
function parse(html, response) {
  html = html
    .replace("{name}", response.name)
    .replace("{birthdate}", response.birthdate)
    .replace("{profilePic}", response.profilePic);
  return Promise.resolve(html);
}

//levantar el servidor --> modulo http + función createServer (recibe una función de callback,
//que recibe request y response)

const server = http
  .createServer(function (req, res) {
    //si la url es 'api' -> devolvemos el JSON beatles

    if (req.url === "/api") {
      //server response (statuscode,reasonphrase)
      res.writeHead(200, { "Content-Type": "application/json" });
      //le enviamos string (o buffers). -> texto plano.
      res.end(JSON.stringify(beatles));
      return;
    }

    if (req.url.substring(0, 5) === "/api/" && req.url.length > 5) {
      const beatle = req.url.split("/").pop();
      //si el filter me da TRUE me responde con un arreglo de un
      //solo beatle.
      const response = beatles.filter(function (x) {
        return encodeURI(x.name) === beatle;
      })[0];
      //si no es undifined ->
      if (response) {
        res.writeHead(200, { "Content-Type": "application/json" });
        res.end(JSON.stringify(response));
        return;
      }
      res.writeHead(404, { "Content-Type": "text/plain" });
      res.end("404 Not Found!");
      return;
    }
    if (req.url === "/") {
      return home.then(function (html) {
        res.writeHead(200, { "Content-Type": "text/html" });
        res.end(html);
      })
    }
    //chequeo la url
    if (req.url[0] === "/" && req.url.length > 2) {
      const beatle = req.url.split("/").pop();
      const response = beatles.filter(function (x) {
        return encodeURI(x.name) === beatle;
      })[0];
    
    if (response) {
      return profile
        .then(function (data) {
          return parse(data, response);
        })
        .then(function (html) {
          res.writeHead(200, { "Content-Type": "text/html" });
          res.end(html);
        });
    }
  }
  })
  
  server.listen(port);