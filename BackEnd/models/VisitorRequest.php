<?php

class VisitorRequest
{
    private $conn;
    private $table = 'visitor_requests';

    public function __construct($db)
    {
        $this->conn = $db;
    }

    /**
     * Create a new visitor request
     */
    public function create($fullName, $nic, $contactPhone, $email, $purpose, $department, $visitDate, $visitTime, $vehicleNo = null, $notes = null, $userId = null)
    {
        // Generate unique reference number (e.g. VP-2026-0004)
        $year = date('Y');
        $seqSql = "SELECT COUNT(*) FROM `{$this->table}`";
        $seqStmt = $this->conn->query($seqSql);
        $count = (int)$seqStmt->fetchColumn() + 1;
        $refNo = sprintf("VP-%s-%04d", $year, $count);

        $query = "INSERT INTO `{$this->table}` 
                  (`ref_no`, `user_id`, `full_name`, `nic`, `contact_phone`, `email`, `purpose`, `department`, `visit_date`, `visit_time`, `vehicle_no`, `notes`, `status`) 
                  VALUES (:ref_no, :user_id, :full_name, :nic, :contact_phone, :email, :purpose, :department, :visit_date, :visit_time, :vehicle_no, :notes, 'Pending')";

        $stmt = $this->conn->prepare($query);

        $stmt->bindParam(":ref_no", $refNo);
        $stmt->bindParam(":user_id", $userId);
        $stmt->bindParam(":full_name", $fullName);
        $stmt->bindParam(":nic", $nic);
        $stmt->bindParam(":contact_phone", $contactPhone);
        $stmt->bindParam(":email", $email);
        $stmt->bindParam(":purpose", $purpose);
        $stmt->bindParam(":department", $department);
        $stmt->bindParam(":visit_date", $visitDate);
        $stmt->bindParam(":visit_time", $visitTime);
        $stmt->bindParam(":vehicle_no", $vehicleNo);
        $stmt->bindParam(":notes", $notes);

        if ($stmt->execute()) {
            return [
                'id' => $this->conn->lastInsertId(),
                'ref_no' => $refNo
            ];
        }

        return false;
    }

    /**
     * Get all visitor requests (or filtered by user_id or status)
     */
    public function getAll($userId = null, $status = null)
    {
        $sql = "SELECT * FROM `{$this->table}` WHERE 1=1";
        $params = [];

        if (!empty($userId)) {
            $sql .= " AND user_id = :user_id";
            $params[':user_id'] = $userId;
        }

        if (!empty($status) && $status !== 'all') {
            $sql .= " AND status = :status";
            $params[':status'] = $status;
        }

        $sql .= " ORDER BY id DESC";

        $stmt = $this->conn->prepare($sql);
        $stmt->execute($params);

        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }

    /**
     * Get single request by ID
     */
    public function getById($id)
    {
        $query = "SELECT * FROM `{$this->table}` WHERE id = :id LIMIT 1";
        $stmt = $this->conn->prepare($query);
        $stmt->bindParam(":id", $id, PDO::PARAM_INT);
        $stmt->execute();
        return $stmt->fetch(PDO::FETCH_ASSOC);
    }

    /**
     * Update visitor request status
     */
    public function updateStatus($id, $status)
    {
        $query = "UPDATE `{$this->table}` SET status = :status WHERE id = :id";
        $stmt = $this->conn->prepare($query);
        $stmt->bindParam(":status", $status);
        $stmt->bindParam(":id", $id, PDO::PARAM_INT);
        return $stmt->execute();
    }

    /**
     * Delete a visitor request
     */
    public function delete($id)
    {
        $query = "DELETE FROM `{$this->table}` WHERE id = :id";
        $stmt = $this->conn->prepare($query);
        $stmt->bindParam(":id", $id, PDO::PARAM_INT);
        return $stmt->execute();
    }
}
