// Basit HTTP Sunucusu
// Bu betik, projeyi yerel bir HTTP sunucusunda çalıştırmak için kullanılır.

const http = require('http');
const fs = require('fs');
const path = require('path');

const PORT = process.env.PORT || 3000;

// MIME türleri
const MIME_TYPES = {
  '.html': 'text/html',
  '.css': 'text/css',
  '.js': 'text/javascript',
  '.json': 'application/json',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.gif': 'image/gif',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon',
  '.txt': 'text/plain',
  '.md': 'text/markdown',
};

// HTTP sunucusu oluştur
const server = http.createServer((req, res) => {
  console.log(`${req.method} ${req.url}`);

  // URL'yi işle
  let filePath = '.' + req.url;
  if (filePath === './') {
    filePath = './index.html';
  }

  // Dosya uzantısını al
  const extname = path.extname(filePath);
  let contentType = MIME_TYPES[extname] || 'application/octet-stream';

  // Dosyayı oku
  fs.readFile(filePath, (error, content) => {
    if (error) {
      if (error.code === 'ENOENT') {
        // Sayfa bulunamadı
        fs.readFile('./404.html', (err, content) => {
          if (err) {
            res.writeHead(404);
            res.end('404 Not Found');
          } else {
            res.writeHead(404, { 'Content-Type': 'text/html' });
            res.end(content, 'utf-8');
          }
        });
      } else {
        // Sunucu hatası
        res.writeHead(500);
        res.end(`Server Error: ${error.code}`);
      }
    } else {
      // Başarılı yanıt
      res.writeHead(200, { 'Content-Type': contentType });
      res.end(content, 'utf-8');
    }
  });
});

// Sunucuyu başlat
server.listen(PORT, () => {
  console.log(`Sunucu http://localhost:${PORT} adresinde çalışıyor`);
  console.log('Durdurmak için Ctrl+C tuşlarına basın');
});