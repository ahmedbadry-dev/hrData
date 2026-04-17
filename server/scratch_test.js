const fs = require('fs');
const cheerio = require('cheerio');
const html = fs.readFileSync('d:\\MINE\\Software Engineering\\Projects\\Mostaql\\kafoo\\home.html', 'utf8');
const $ = cheerio.load(html);

console.log('Testing link selectors:');
let links = [];
$('ul.job_listings li.job_listing > a').each((_, el) => {
    links.push($(el).attr('href'));
});
console.log('ul.job_listings li.job_listing > a:', links.length);

links = [];
$('ul.job_listings li a').each((_, el) => {
    links.push($(el).attr('href'));
});
console.log('ul.job_listings li a:', links.length);

links = [];
$('div.job_listings ul.job_listings li a').each((_, el) => {
    links.push($(el).attr('href'));
});
console.log('div.job_listings ul.job_listings li a:', links.length);

links = [];
$('a[href*="/jobs/"]').each((_, el) => {
    links.push($(el).attr('href'));
});
console.log('a[href*="/jobs/"]:', links.length);
