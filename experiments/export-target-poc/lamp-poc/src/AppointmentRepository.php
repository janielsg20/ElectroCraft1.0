<?php
declare(strict_types=1);
namespace ElectroCraft\Poc;
use PDO;
final class AppointmentRepository {
  public function __construct(private PDO $pdo) {}
  public function list(): array { $stmt=$this->pdo->prepare('SELECT id, client_name AS clientName, starts_at AS startsAt, status FROM appointments ORDER BY starts_at ASC'); $stmt->execute(); return $stmt->fetchAll(PDO::FETCH_ASSOC); }
  public function create(array $input): array { $id=bin2hex(random_bytes(12)); $stmt=$this->pdo->prepare('INSERT INTO appointments (id, client_name, starts_at, status) VALUES (:id,:client_name,:starts_at,:status)'); $stmt->execute(['id'=>$id,'client_name'=>$input['clientName'],'starts_at'=>$input['startsAt'],'status'=>$input['status'] ?? 'pending']); return ['id'=>$id,'clientName'=>$input['clientName'],'startsAt'=>$input['startsAt'],'status'=>$input['status'] ?? 'pending']; }
}
