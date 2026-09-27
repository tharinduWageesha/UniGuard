<?php

class Event
{
    private $conn;
    private $table = 'events';

    public function __construct($db)
    {
        $this->conn = $db;
    }

    /**
     * Get all events with optional status filter
     */
    public function getAll($statusFilter = null)
    {
        $query = "SELECT * FROM `{$this->table}`";
        $params = [];

        if (!empty($statusFilter) && $statusFilter !== 'all') {
            $query .= " WHERE `status` = :statusFilter";
            $params[':statusFilter'] = $statusFilter;
        }

        $query .= " ORDER BY `event_date` ASC, `id` DESC";

        $stmt = $this->conn->prepare($query);
        $stmt->execute($params);
        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }

    /**
     * Get single event by ID
     */
    public function getById($id)
    {
        $query = "SELECT * FROM `{$this->table}` WHERE id = :id LIMIT 1";
        $stmt = $this->conn->prepare($query);
        $stmt->bindParam(':id', $id, PDO::PARAM_INT);
        $stmt->execute();
        return $stmt->fetch(PDO::FETCH_ASSOC);
    }

    /**
     * Create a new event record
     */
    public function create($eventName, $organizer, $eventDate, $startTime, $endTime, $venue, $expectedAttendees, $contactNumber, $description, $status = 'upcoming')
    {
        // Auto-generate reference number
        $lastIdStmt = $this->conn->query("SELECT MAX(id) FROM `{$this->table}`");
        $nextId = (int)$lastIdStmt->fetchColumn() + 1 + 800;
        $refNo = "EVT-" . $nextId;

        $query = "INSERT INTO `{$this->table}` 
            (`ref_no`, `event_name`, `organizer`, `event_date`, `start_time`, `end_time`, `venue`, `expected_attendees`, `contact_number`, `description`, `status`)
            VALUES
            (:ref_no, :event_name, :organizer, :event_date, :start_time, :end_time, :venue, :expected_attendees, :contact_number, :description, :status)";

        $stmt = $this->conn->prepare($query);

        $params = [
            ':ref_no' => $refNo,
            ':event_name' => $eventName,
            ':organizer' => $organizer,
            ':event_date' => $eventDate,
            ':start_time' => $startTime,
            ':end_time' => $endTime,
            ':venue' => $venue,
            ':expected_attendees' => (int)$expectedAttendees,
            ':contact_number' => $contactNumber,
            ':description' => $description,
            ':status' => $status ?: 'upcoming'
        ];

        if ($stmt->execute($params)) {
            return $this->conn->lastInsertId();
        }

        return false;
    }

    /**
     * Update an existing event record
     */
    public function update($id, $eventName, $organizer, $eventDate, $startTime, $endTime, $venue, $expectedAttendees, $contactNumber, $description, $status = 'upcoming')
    {
        $query = "UPDATE `{$this->table}` SET
            `event_name` = :event_name,
            `organizer` = :organizer,
            `event_date` = :event_date,
            `start_time` = :start_time,
            `end_time` = :end_time,
            `venue` = :venue,
            `expected_attendees` = :expected_attendees,
            `contact_number` = :contact_number,
            `description` = :description,
            `status` = :status
            WHERE id = :id";

        $stmt = $this->conn->prepare($query);

        $params = [
            ':id' => (int)$id,
            ':event_name' => $eventName,
            ':organizer' => $organizer,
            ':event_date' => $eventDate,
            ':start_time' => $startTime,
            ':end_time' => $endTime,
            ':venue' => $venue,
            ':expected_attendees' => (int)$expectedAttendees,
            ':contact_number' => $contactNumber,
            ':description' => $description,
            ':status' => $status ?: 'upcoming'
        ];

        return $stmt->execute($params);
    }

    /**
     * Delete an event by ID
     */
    public function delete($id)
    {
        $query = "DELETE FROM `{$this->table}` WHERE id = :id";
        $stmt = $this->conn->prepare($query);
        $stmt->bindParam(':id', $id, PDO::PARAM_INT);
        return $stmt->execute();
    }
}
