import fs from 'fs';
import path from 'path';
import https from 'https';

const POLITICIANS = [
  { id: 'lula', title: 'Luiz_Inácio_Lula_da_Silva' },
  { id: 'tarcisio-de-freitas', title: 'Tarcísio_de_Freitas' },
  { id: 'romeu-zema', title: 'Romeu_Zema' },
  { id: 'rodrigo-pacheco', title: 'Rodrigo_Pacheco' },
  { id: 'arthur-lira', title: 'Arthur_Lira' },
  { id: 'nikolas-ferreira', title: 'Nikolas_Ferreira' },
  { id: 'tabata-amaral', title: 'Tabata_Amaral' },
  { id: 'eduardo-leite', title: 'Eduardo_Leite' },
  { id: 'ronaldo-caiado', title: 'Ronaldo_Caiado' },
  { id: 'guilherme-boulos', title: 'Guilherme_Boulos' },
  { id: 'cleitinho', title: 'Cleitinho' },
  { id: 'claudio-castro', title: 'Cláudio_Castro' },
  { id: 'jair-bolsonaro', title: 'Jair_Bolsonaro' },
  { id: 'flavio-bolsonaro', title: 'Flávio_Bolsonaro' }
];

const targetDir = path.resolve('public/images/politicians');
if (!fs.existsSync(targetDir)) {
  fs.mkdirSync(targetDir, { recursive: true });
}

function fetchJson(url) {
  return new Promise((resolve, reject) => {
    https.get(url, { headers: { 'User-Agent': 'FatosFakesCivic/1.0 (contact@fatosfakes.org)' } }, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          resolve(JSON.parse(data));
        } catch (e) {
          reject(e);
        }
      });
    }).on('error', reject);
  });
}

function downloadImage(url, dest) {
  return new Promise((resolve, reject) => {
    const file = fs.createWriteStream(dest);
    https.get(url, { headers: { 'User-Agent': 'FatosFakesCivic/1.0 (contact@fatosfakes.org)' } }, (res) => {
      if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
        return downloadImage(res.headers.location, dest).then(resolve).catch(reject);
      }
      if (res.statusCode !== 200) {
        return reject(new Error(`Failed with HTTP ${res.statusCode} for ${url}`));
      }
      res.pipe(file);
      file.on('finish', () => {
        file.close(() => resolve(dest));
      });
    }).on('error', err => {
      fs.unlink(dest, () => reject(err));
    });
  });
}

async function main() {
  const titles = POLITICIANS.map(p => encodeURIComponent(p.title)).join('|');
  const apiUrl = `https://pt.wikipedia.org/w/api.php?action=query&titles=${titles}&prop=pageimages&format=json&pithumbsize=600`;
  
  console.log('Consultando Wikipedia PageImages API...');
  const res = await fetchJson(apiUrl);
  const pages = res?.query?.pages || {};

  for (const pageId of Object.keys(pages)) {
    const page = pages[pageId];
    const item = POLITICIANS.find(p => p.title.replace(/_/g, ' ') === page.title);
    if (!item) continue;

    const thumb = page.thumbnail?.source;
    if (thumb) {
      const ext = path.extname(new URL(thumb).pathname) || '.jpg';
      const dest = path.join(targetDir, `${item.id}${ext}`);
      console.log(`Baixando foto real de ${page.title} -> ${dest}`);
      try {
        await downloadImage(thumb, dest);
        console.log(`✓ Sucesso: ${item.id}${ext}`);
      } catch (err) {
        console.error(`Erro ao baixar ${item.id}:`, err.message);
      }
    } else {
      console.warn(`Sem thumbnail para ${page.title}`);
    }
  }
}

main().catch(console.error);
