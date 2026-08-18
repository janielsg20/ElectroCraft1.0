// @ts-check
import { analyzeTargetCapabilities } from './capabilities.js';
import { assertSafeArtifactPaths, escapePhpSingle } from './artifact.js';
import { exportIrFingerprint } from './export-ir.js';

/** @param {typeof import('./export-ir.js').exportIrPoc} ir */
export function compileLamp(ir) {
  const fingerprint = exportIrFingerprint(ir);
  const title = escapePhpSingle(ir.screen.title);
  const files = {
    'composer.json': JSON.stringify({
      name:'electrocraft/lamp-poc',
      description:'ElectroCraft LAMP export parity proof-of-concept',
      type:'project',
      license:'MIT',
      require:{php:'^8.2','slim/slim':'4.15.2','slim/psr7':'1.8.0','slim/csrf':'1.5.1'},
      autoload:{'psr-4':{'ElectroCraft\\Poc\\':'src/'}},
      config:{'sort-packages':true,'allow-plugins':{}}
    }, null, 2)+'\n',
    '.env.example': 'EC_DSN=mysql:host=127.0.0.1;port=3306;dbname=electrocraft\nEC_DB_USER=electrocraft\nEC_DB_PASSWORD=electrocraft\n',
    'database/migrations/001_create_appointments.sql': `CREATE TABLE IF NOT EXISTS appointments (\n  id VARCHAR(64) PRIMARY KEY,\n  client_name VARCHAR(160) NOT NULL,\n  starts_at DATETIME NOT NULL,\n  status ENUM('pending','confirmed','done') NOT NULL DEFAULT 'pending',\n  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,\n  INDEX idx_appointments_starts_at (starts_at)\n) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;\n`,
    'src/AppointmentRepository.php': `<?php\ndeclare(strict_types=1);\nnamespace ElectroCraft\\Poc;\nuse PDO;\nfinal class AppointmentRepository {\n  public function __construct(private PDO $pdo) {}\n  public function list(): array { $stmt=$this->pdo->prepare('SELECT id, client_name AS clientName, starts_at AS startsAt, status FROM appointments ORDER BY starts_at ASC'); $stmt->execute(); return $stmt->fetchAll(PDO::FETCH_ASSOC); }\n  public function create(array $input): array { $id=bin2hex(random_bytes(12)); $stmt=$this->pdo->prepare('INSERT INTO appointments (id, client_name, starts_at, status) VALUES (:id,:client_name,:starts_at,:status)'); $stmt->execute(['id'=>$id,'client_name'=>$input['clientName'],'starts_at'=>$input['startsAt'],'status'=>$input['status'] ?? 'pending']); return ['id'=>$id,'clientName'=>$input['clientName'],'startsAt'=>$input['startsAt'],'status'=>$input['status'] ?? 'pending']; }\n}\n`,
    'public/index.php': `<?php\ndeclare(strict_types=1);\nsession_start();\nuse ElectroCraft\\Poc\\AppointmentRepository;\nuse Psr\\Http\\Message\\ResponseInterface as Response;\nuse Psr\\Http\\Message\\ServerRequestInterface as Request;\nuse Slim\\Csrf\\Guard;\nuse Slim\\Factory\\AppFactory;\nuse Slim\\Psr7\\Factory\\ResponseFactory;\nrequire __DIR__ . '/../vendor/autoload.php';\n$pdo = new PDO(getenv('EC_DSN') ?: 'mysql:host=127.0.0.1;port=3306;dbname=electrocraft', getenv('EC_DB_USER') ?: 'electrocraft', getenv('EC_DB_PASSWORD') ?: 'electrocraft', [PDO::ATTR_ERRMODE=>PDO::ERRMODE_EXCEPTION, PDO::ATTR_DEFAULT_FETCH_MODE=>PDO::FETCH_ASSOC]);\n$repo = new AppointmentRepository($pdo);\n$app = AppFactory::create();\n$app->addBodyParsingMiddleware();\n$csrf = new Guard(new ResponseFactory());\n$json = static function(Response $response, mixed $payload, int $status=200): Response { $response->getBody()->write(json_encode($payload, JSON_THROW_ON_ERROR)); return $response->withHeader('Content-Type','application/json')->withStatus($status); };\n$app->get('/appointments', function(Request $request, Response $response) use ($repo,$json): Response { return $json($response,['data'=>$repo->list(),'meta'=>['screen'=>'${title}','irFingerprint'=>'${fingerprint}']]); });\n$app->get('/csrf', function(Request $request, Response $response) use ($json): Response { return $json($response,['csrf_name'=>$request->getAttribute('csrf_name'),'csrf_value'=>$request->getAttribute('csrf_value')]); })->add($csrf);\n$app->post('/appointments', function(Request $request, Response $response) use ($repo,$json): Response { $input=(array)$request->getParsedBody(); if (!is_string($input['clientName'] ?? null) || trim($input['clientName'])==='') return $json($response,['error'=>'clientName requerido'],422); if (!is_string($input['startsAt'] ?? null) || trim($input['startsAt'])==='') return $json($response,['error'=>'startsAt requerido'],422); $created=$repo->create($input); return $json($response,['data'=>$created,'meta'=>['actionGraph'=>'${escapePhpSingle(ir.actionGraph.id)}']],201); })->add($csrf);\n$app->run();\n`,
    'electrocraft-ir.json': JSON.stringify({fingerprint,ir}, null, 2)+'\n',
  };
  assertSafeArtifactPaths(files);
  return {target:'lamp',irFingerprint:fingerprint,files,capability:analyzeTargetCapabilities('lamp')};
}
