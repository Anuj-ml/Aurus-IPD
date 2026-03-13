
import fs from 'fs';
import https from 'https';
import path from 'path';

const url = "https://raw.githubusercontent.com/dsrscientist/dataset1/master/bank_churn.csv";
const dest = path.join(process.cwd(), 'public', 'churn_data.csv');

const file = fs.createWriteStream(dest);
https.get(url, function(response) {
  response.pipe(file);
  file.on('finish', function() {
    file.close();
    console.log("Download completed");
  });
}).on('error', function(err) {
  fs.unlink(dest, () => {}); 
  console.error("Error downloading file: " + err.message);
});
