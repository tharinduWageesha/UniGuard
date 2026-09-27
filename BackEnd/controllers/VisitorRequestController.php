<?php

require_once __DIR__ . '/../models/VisitorRequest.php';

class VisitorRequestController
{
    private $visitorRequestModel;

    public function __construct($db)
    {
        $this->visitorRequestModel = new VisitorRequest($db);
    }

    /**
     * Create a new Visitor Request
     */
    public function createVisitorRequest()
    {
        $input = json_decode(file_get_contents('php://input'), true);
        if (!$input) {
            $input = $_POST;
        }

        $fullName = trim($input['fullName'] ?? $input['full_name'] ?? '');
        $nic = trim($input['nic'] ?? '');
        $contactPhone = trim($input['contact'] ?? $input['contact_phone'] ?? '');
        $email = trim($input['email'] ?? '');
        $purpose = trim($input['purpose'] ?? '');
        $department = trim($input['hostDept'] ?? $input['department'] ?? '');
        $visitDate = trim($input['visitDate'] ?? $input['visit_date'] ?? '');
        $visitTime = trim($input['visitTime'] ?? $input['visit_time'] ?? '');
        $vehicleNo = trim($input['vehicleNo'] ?? $input['vehicle_no'] ?? '');
        $notes = trim($input['notes'] ?? '');
        $userId = isset($input['user_id']) ? intval($input['user_id']) : null;

        if (session_status() === PHP_SESSION_NONE) {
            session_start();
        }
        if (!$userId && isset($_SESSION['user']['id'])) {
            $userId = $_SESSION['user']['id'];
        }

        // Basic validation
        if (empty($fullName) || empty($nic) || empty($contactPhone) || empty($email) || empty($purpose) || empty($department) || empty($visitDate) || empty($visitTime)) {
            http_response_code(400);
            echo json_encode([
                'status' => 'error',
                'message' => 'All required fields must be provided.'
            ]);
            return;
        }

        $result = $this->visitorRequestModel->create(
            $fullName,
            $nic,
            $contactPhone,
            $email,
            $purpose,
            $department,
            $visitDate,
            $visitTime,
            !empty($vehicleNo) ? $vehicleNo : null,
            !empty($notes) ? $notes : null,
            $userId
        );

        if ($result) {
            http_response_code(201);
            echo json_encode([
                'status' => 'success',
                'message' => 'Visitor request submitted successfully.',
                'ref_no' => $result['ref_no'],
                'id' => $result['id']
            ]);
        } else {
            http_response_code(500);
            echo json_encode([
                'status' => 'error',
                'message' => 'Failed to save visitor request.'
            ]);
        }
    }

    /**
     * Get list of Visitor Requests
     */
    public function getVisitorRequests()
    {
        $userId = isset($_GET['user_id']) ? intval($_GET['user_id']) : null;
        $status = isset($_GET['status']) ? trim($_GET['status']) : null;

        if (session_status() === PHP_SESSION_NONE) {
            session_start();
        }
        // If logged in user is a Visitor, restrict results to their own requests by default unless requested otherwise
        if (!$userId && isset($_SESSION['user']) && strtolower($_SESSION['user']['role'] ?? '') === 'visitor') {
            $userId = $_SESSION['user']['id'];
        }

        $requests = $this->visitorRequestModel->getAll($userId, $status);

        http_response_code(200);
        echo json_encode([
            'status' => 'success',
            'data' => $requests
        ]);
    }

    /**
     * Update Visitor Request status (Approve / Reject)
     */
    public function updateVisitorStatus()
    {
        $input = json_decode(file_get_contents('php://input'), true);
        if (!$input) {
            $input = $_POST;
        }

        $id = intval($input['id'] ?? 0);
        $status = trim($input['status'] ?? '');

        if (!$id || empty($status)) {
            http_response_code(400);
            echo json_encode([
                'status' => 'error',
                'message' => 'Request ID and valid status are required.'
            ]);
            return;
        }

        $success = $this->visitorRequestModel->updateStatus($id, $status);

        if ($success) {
            http_response_code(200);
            echo json_encode([
                'status' => 'success',
                'message' => "Visitor request status updated to '{$status}'."
            ]);
        } else {
            http_response_code(500);
            echo json_encode([
                'status' => 'error',
                'message' => 'Failed to update visitor request status.'
            ]);
        }
    }
}
