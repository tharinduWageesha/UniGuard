<?php

class TaskController
{
    private $db;

    public function __construct($db)
    {
        $this->db = $db;
    }

    /**
     * Get Tasks List (READ)
     */
    public function getTasks()
    {
        try {
            $status = trim($_GET['status'] ?? 'all');
            $search = trim($_GET['search'] ?? '');
            $sector = trim($_GET['sector'] ?? '');
            $jso_id = (int)($_GET['jso_id'] ?? 0);

            $query = "SELECT * FROM tasks WHERE 1=1";
            $params = [];

            if (!empty($status) && strtolower($status) !== 'all') {
                $query .= " AND status = :st";
                $params[':st'] = $status;
            }

            if (!empty($sector) && strtolower($sector) !== 'all') {
                $query .= " AND (sector LIKE :sec OR :sec_raw LIKE CONCAT('%', sector, '%') OR sector LIKE CONCAT('%', :sec_raw, '%'))";
                $params[':sec'] = "%$sector%";
                $params[':sec_raw'] = $sector;
            }

            if (!empty($search)) {
                $query .= " AND (task_code LIKE :s OR jso_name LIKE :s OR title LIKE :s OR sector LIKE :s)";
                $params[':s'] = "%$search%";
            }

            if ($jso_id > 0) {
                $query .= " AND jso_id = :jso_id";
                $params[':jso_id'] = $jso_id;
            }

            $query .= " ORDER BY created_at DESC";

            $stmt = $this->db->prepare($query);
            $stmt->execute($params);
            $tasks = $stmt->fetchAll(PDO::FETCH_ASSOC);

            http_response_code(200);
            echo json_encode(['status' => 'success', 'data' => $tasks]);
        } catch (Exception $e) {
            http_response_code(500);
            echo json_encode(['status' => 'error', 'message' => $e->getMessage()]);
        }
    }

    /**
     * Get Available JSOs with duty status summary, filtered by Sector
     */
    public function getJsos()
    {
        try {
            $sector = trim($_GET['sector'] ?? '');

            $query = "SELECT j.id, CONCAT(COALESCE(j.fname, ''), ' ', COALESCE(j.lname, '')) as name, j.badge_id, j.assigned_sector, j.phone, j.status as account_status,
                      (SELECT COUNT(*) FROM tasks t WHERE (t.jso_id = j.id OR t.jso_badge = j.badge_id) AND t.status IN ('Pending', 'In Progress')) as active_tasks_count
                      FROM jsos j WHERE j.status = 'Active'";
            $params = [];

            if (!empty($sector) && strtolower($sector) !== 'all') {
                $query .= " AND (j.assigned_sector LIKE :sec OR :sec_raw LIKE CONCAT('%', j.assigned_sector, '%') OR j.assigned_sector LIKE CONCAT('%', :sec_raw, '%'))";
                $params[':sec'] = "%$sector%";
                $params[':sec_raw'] = $sector;
            }

            $query .= " ORDER BY j.fname ASC";

            $stmt = $this->db->prepare($query);
            $stmt->execute($params);
            $jsos = $stmt->fetchAll(PDO::FETCH_ASSOC);

            foreach ($jsos as &$j) {
                $j['name'] = trim($j['name']);
                if (empty($j['name'])) {
                    $j['name'] = 'JSO Officer ' . ($j['badge_id'] ?? '');
                }
                $j['duty_status'] = ($j['active_tasks_count'] > 0) ? 'On Duty' : 'Available';
            }

            http_response_code(200);
            echo json_encode(['status' => 'success', 'data' => $jsos]);
        } catch (Exception $e) {
            http_response_code(500);
            echo json_encode(['status' => 'error', 'message' => $e->getMessage()]);
        }
    }

    /**
     * Create New Task Assignment (CREATE)
     */
    public function createTask()
    {
        try {
            $input = json_decode(file_get_contents('php://input'), true) ?? $_POST;

            $jso_identifier = trim($input['jso_select'] ?? $input['jso_id'] ?? $input['jso'] ?? '');
            $title = trim($input['title'] ?? $input['taskTitle'] ?? '');
            $sector = trim($input['sector'] ?? $input['sectorSelect'] ?? 'Main Gate Complex');
            $priority = trim($input['priority'] ?? $input['prioritySelect'] ?? 'Normal');
            $deadline = trim($input['deadline'] ?? $input['deadlineTime'] ?? '');
            $instructions = trim($input['instructions'] ?? $input['taskInstructions'] ?? '');
            $oic_name = trim($input['oic_name'] ?? 'OIC Somendra');
            $oic_sector = trim($input['oic_sector'] ?? '');

            if (empty($jso_identifier) || empty($title) || empty($deadline)) {
                http_response_code(400);
                echo json_encode(['status' => 'error', 'message' => 'JSO Officer, Task Title, and Deadline are required fields.']);
                return;
            }

            // Lookup JSO details from DB
            $jso_id = null;
            $jso_badge = null;
            $jso_name = $jso_identifier;
            $jso_sector = '';

            $stmtJso = $this->db->prepare("SELECT id, fname, lname, badge_id, assigned_sector FROM jsos WHERE badge_id = :id OR id = :id OR username = :id LIMIT 1");
            $stmtJso->execute([':id' => $jso_identifier]);
            $jsoRow = $stmtJso->fetch(PDO::FETCH_ASSOC);

            if ($jsoRow) {
                $jso_id = $jsoRow['id'];
                $jso_badge = $jsoRow['badge_id'];
                $jso_name = trim(($jsoRow['fname'] ?? '') . ' ' . ($jsoRow['lname'] ?? ''));
                if (empty($jso_name)) $jso_name = 'Officer ' . $jso_badge;
                $jso_sector = trim($jsoRow['assigned_sector'] ?? '');
            }

            // Verify OIC Sector authorization
            if (!empty($oic_sector) && !empty($jso_sector)) {
                $pos1 = stripos($oic_sector, $jso_sector);
                $pos2 = stripos($jso_sector, $oic_sector);
                if ($pos1 === false && $pos2 === false) {
                    http_response_code(403);
                    echo json_encode([
                        'status' => 'error',
                        'message' => "Access Denied: You are assigned to '{$oic_sector}' and can only assign tasks to JSOs in your sector."
                    ]);
                    return;
                }
            }

            // Generate unique task code
            $task_code = 'TSK-' . rand(1000, 9999);

            $query = "INSERT INTO tasks (task_code, jso_id, jso_badge, jso_name, oic_name, title, sector, priority, deadline, instructions, status)
                      VALUES (:tc, :jid, :jbadge, :jname, :oic, :title, :sector, :prio, :dl, :inst, 'Pending')";
            $stmt = $this->db->prepare($query);
            $stmt->execute([
                ':tc' => $task_code,
                ':jid' => $jso_id,
                ':jbadge' => $jso_badge,
                ':jname' => $jso_name,
                ':oic' => $oic_name,
                ':title' => $title,
                ':sector' => $sector,
                ':prio' => $priority,
                ':dl' => $deadline,
                ':inst' => $instructions
            ]);

            http_response_code(201);
            echo json_encode([
                'status' => 'success',
                'message' => 'Task assigned successfully.',
                'task_code' => $task_code
            ]);
        } catch (Exception $e) {
            http_response_code(500);
            echo json_encode(['status' => 'error', 'message' => $e->getMessage()]);
        }
    }

    /**
     * Update Task Status (UPDATE)
     */
    public function updateTaskStatus()
    {
        try {
            $input = json_decode(file_get_contents('php://input'), true) ?? $_POST;
            $id = (int)($input['id'] ?? 0);
            $task_code = trim($input['task_code'] ?? '');
            $status = trim($input['status'] ?? 'Pending');

            if ($id <= 0 && empty($task_code)) {
                http_response_code(400);
                echo json_encode(['status' => 'error', 'message' => 'Task ID or Task Code is required.']);
                return;
            }

            if ($id > 0) {
                $stmt = $this->db->prepare("UPDATE tasks SET status = :st WHERE id = :id");
                $stmt->execute([':st' => $status, ':id' => $id]);
            } else {
                $stmt = $this->db->prepare("UPDATE tasks SET status = :st WHERE task_code = :tc");
                $stmt->execute([':st' => $status, ':tc' => $task_code]);
            }

            http_response_code(200);
            echo json_encode(['status' => 'success', 'message' => 'Task status updated successfully.']);
        } catch (Exception $e) {
            http_response_code(500);
            echo json_encode(['status' => 'error', 'message' => $e->getMessage()]);
        }
    }

    /**
     * Delete Task (DELETE)
     */
    public function deleteTask()
    {
        try {
            $input = json_decode(file_get_contents('php://input'), true) ?? $_POST;
            $id = (int)($input['id'] ?? $_GET['id'] ?? 0);

            if ($id <= 0) {
                http_response_code(400);
                echo json_encode(['status' => 'error', 'message' => 'Invalid Task ID.']);
                return;
            }

            $stmt = $this->db->prepare("DELETE FROM tasks WHERE id = :id");
            $stmt->execute([':id' => $id]);

            http_response_code(200);
            echo json_encode(['status' => 'success', 'message' => 'Task deleted successfully.']);
        } catch (Exception $e) {
            http_response_code(500);
            echo json_encode(['status' => 'error', 'message' => $e->getMessage()]);
        }
    }
}
