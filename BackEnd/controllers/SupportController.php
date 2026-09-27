<?php

class SupportController
{
    private $db;

    public function __construct($db)
    {
        $this->db = $db;
    }

    /**
     * Get live support statistics for Dashboard
     */
    public function getStats()
    {
        try {
            $faqsCount = (int)$this->db->query("SELECT COUNT(*) FROM faqs")->fetchColumn();
            $categoriesCount = (int)$this->db->query("SELECT COUNT(*) FROM faq_categories")->fetchColumn();
            $pendingCount = (int)$this->db->query("SELECT COUNT(*) FROM support_tickets WHERE status IN ('Pending', 'In Progress')")->fetchColumn();
            $resolvedCount = (int)$this->db->query("SELECT COUNT(*) FROM support_tickets WHERE status = 'Resolved'")->fetchColumn();

            http_response_code(200);
            echo json_encode([
                'status' => 'success',
                'data' => [
                    'totalFaqs' => $faqsCount,
                    'totalCategories' => $categoriesCount,
                    'pendingRequests' => $pendingCount,
                    'resolvedRequests' => $resolvedCount
                ]
            ]);
        } catch (Exception $e) {
            http_response_code(500);
            echo json_encode(['status' => 'error', 'message' => $e->getMessage()]);
        }
    }

    /**
     * Get Support Tickets (READ)
     */
    public function getTickets()
    {
        try {
            $search = trim($_GET['search'] ?? '');
            $category = trim($_GET['category'] ?? '');
            $status = trim($_GET['status'] ?? '');

            $query = "SELECT * FROM support_tickets WHERE 1=1";
            $params = [];

            if (!empty($search)) {
                $query .= " AND (ticket_number LIKE :s OR sender_name LIKE :s OR sender_email LIKE :s OR subject LIKE :s OR message LIKE :s)";
                $params[':s'] = "%$search%";
            }

            if (!empty($category) && $category !== 'All') {
                $query .= " AND category = :cat";
                $params[':cat'] = $category;
            }

            if (!empty($status) && $status !== 'All') {
                $query .= " AND status = :st";
                $params[':st'] = $status;
            }

            $query .= " ORDER BY created_at DESC";

            $stmt = $this->db->prepare($query);
            $stmt->execute($params);
            $tickets = $stmt->fetchAll(PDO::FETCH_ASSOC);

            http_response_code(200);
            echo json_encode(['status' => 'success', 'data' => $tickets]);
        } catch (Exception $e) {
            http_response_code(500);
            echo json_encode(['status' => 'error', 'message' => $e->getMessage()]);
        }
    }

    /**
     * Create Ticket (CREATE)
     */
    public function createTicket()
    {
        try {
            $input = json_decode(file_get_contents('php://input'), true) ?? $_POST;

            $sender_name = trim($input['sender_name'] ?? $input['name'] ?? '');
            $sender_email = trim($input['sender_email'] ?? $input['email'] ?? '');
            $category = trim($input['category'] ?? 'General');
            $subject = trim($input['subject'] ?? 'Support Inquiry');
            $message = trim($input['message'] ?? '');
            $priority = trim($input['priority'] ?? 'Normal');

            if (empty($sender_name) || empty($sender_email) || empty($message)) {
                http_response_code(400);
                echo json_encode(['status' => 'error', 'message' => 'Name, Email, and Message are required fields.']);
                return;
            }

            // Generate unique ticket number
            $ticket_number = 'TICK-' . rand(1000, 9999);

            $stmt = $this->db->prepare("INSERT INTO support_tickets (ticket_number, sender_name, sender_email, category, subject, message, priority, status) VALUES (:tn, :sn, :se, :cat, :sub, :msg, :prio, 'Pending')");
            $stmt->execute([
                ':tn' => $ticket_number,
                ':sn' => $sender_name,
                ':se' => $sender_email,
                ':cat' => $category,
                ':sub' => $subject,
                ':msg' => $message,
                ':prio' => $priority
            ]);

            http_response_code(201);
            echo json_encode([
                'status' => 'success',
                'message' => 'Support request submitted successfully.',
                'ticket_number' => $ticket_number
            ]);
        } catch (Exception $e) {
            http_response_code(500);
            echo json_encode(['status' => 'error', 'message' => $e->getMessage()]);
        }
    }

    /**
     * Update Ticket / Post Response (UPDATE)
     */
    public function updateTicket()
    {
        try {
            $input = json_decode(file_get_contents('php://input'), true) ?? $_POST;
            $id = (int)($input['id'] ?? 0);

            if ($id <= 0) {
                http_response_code(400);
                echo json_encode(['status' => 'error', 'message' => 'Invalid ticket ID.']);
                return;
            }

            $status = trim($input['status'] ?? 'Pending');
            $response = trim($input['response'] ?? '');
            $priority = trim($input['priority'] ?? 'Normal');
            $escalated_to = trim($input['escalated_to'] ?? '');

            $stmt = $this->db->prepare("UPDATE support_tickets SET status = :st, response = :resp, priority = :prio, escalated_to = :esc WHERE id = :id");
            $stmt->execute([
                ':st' => $status,
                ':resp' => $response,
                ':prio' => $priority,
                ':esc' => $escalated_to,
                ':id' => $id
            ]);

            http_response_code(200);
            echo json_encode(['status' => 'success', 'message' => 'Ticket updated successfully.']);
        } catch (Exception $e) {
            http_response_code(500);
            echo json_encode(['status' => 'error', 'message' => $e->getMessage()]);
        }
    }

    /**
     * Delete Ticket (DELETE)
     */
    public function deleteTicket()
    {
        try {
            $input = json_decode(file_get_contents('php://input'), true) ?? $_POST;
            $id = (int)($input['id'] ?? $_GET['id'] ?? 0);

            if ($id <= 0) {
                http_response_code(400);
                echo json_encode(['status' => 'error', 'message' => 'Invalid ticket ID.']);
                return;
            }

            $stmt = $this->db->prepare("DELETE FROM support_tickets WHERE id = :id");
            $stmt->execute([':id' => $id]);

            http_response_code(200);
            echo json_encode(['status' => 'success', 'message' => 'Ticket deleted successfully.']);
        } catch (Exception $e) {
            http_response_code(500);
            echo json_encode(['status' => 'error', 'message' => $e->getMessage()]);
        }
    }

    /**
     * Get FAQs (READ)
     */
    public function getFaqs()
    {
        try {
            $search = trim($_GET['search'] ?? '');
            $category = trim($_GET['category'] ?? '');

            $query = "SELECT * FROM faqs WHERE 1=1";
            $params = [];

            if (!empty($search)) {
                $query .= " AND (question LIKE :s OR answer LIKE :s)";
                $params[':s'] = "%$search%";
            }

            if (!empty($category) && $category !== 'All') {
                $query .= " AND category_name = :cat";
                $params[':cat'] = $category;
            }

            $query .= " ORDER BY id DESC";

            $stmt = $this->db->prepare($query);
            $stmt->execute($params);
            $faqs = $stmt->fetchAll(PDO::FETCH_ASSOC);

            http_response_code(200);
            echo json_encode(['status' => 'success', 'data' => $faqs]);
        } catch (Exception $e) {
            http_response_code(500);
            echo json_encode(['status' => 'error', 'message' => $e->getMessage()]);
        }
    }

    /**
     * Create FAQ (CREATE)
     */
    public function createFaq()
    {
        try {
            $input = json_decode(file_get_contents('php://input'), true) ?? $_POST;

            $question = trim($input['question'] ?? '');
            $answer = trim($input['answer'] ?? '');
            $category_name = trim($input['category_name'] ?? $input['category'] ?? 'General');

            if (empty($question) || empty($answer)) {
                http_response_code(400);
                echo json_encode(['status' => 'error', 'message' => 'Question and Answer are required.']);
                return;
            }

            $stmt = $this->db->prepare("INSERT INTO faqs (category_name, question, answer) VALUES (:cat, :q, :a)");
            $stmt->execute([
                ':cat' => $category_name,
                ':q' => $question,
                ':a' => $answer
            ]);

            http_response_code(201);
            echo json_encode(['status' => 'success', 'message' => 'FAQ created successfully.']);
        } catch (Exception $e) {
            http_response_code(500);
            echo json_encode(['status' => 'error', 'message' => $e->getMessage()]);
        }
    }

    /**
     * Update FAQ (UPDATE)
     */
    public function updateFaq()
    {
        try {
            $input = json_decode(file_get_contents('php://input'), true) ?? $_POST;
            $id = (int)($input['id'] ?? 0);

            if ($id <= 0) {
                http_response_code(400);
                echo json_encode(['status' => 'error', 'message' => 'Invalid FAQ ID.']);
                return;
            }

            $question = trim($input['question'] ?? '');
            $answer = trim($input['answer'] ?? '');
            $category_name = trim($input['category_name'] ?? $input['category'] ?? 'General');

            $stmt = $this->db->prepare("UPDATE faqs SET category_name = :cat, question = :q, answer = :a WHERE id = :id");
            $stmt->execute([
                ':cat' => $category_name,
                ':q' => $question,
                ':a' => $answer,
                ':id' => $id
            ]);

            http_response_code(200);
            echo json_encode(['status' => 'success', 'message' => 'FAQ updated successfully.']);
        } catch (Exception $e) {
            http_response_code(500);
            echo json_encode(['status' => 'error', 'message' => $e->getMessage()]);
        }
    }

    /**
     * Delete FAQ (DELETE)
     */
    public function deleteFaq()
    {
        try {
            $input = json_decode(file_get_contents('php://input'), true) ?? $_POST;
            $id = (int)($input['id'] ?? $_GET['id'] ?? 0);

            if ($id <= 0) {
                http_response_code(400);
                echo json_encode(['status' => 'error', 'message' => 'Invalid FAQ ID.']);
                return;
            }

            $stmt = $this->db->prepare("DELETE FROM faqs WHERE id = :id");
            $stmt->execute([':id' => $id]);

            http_response_code(200);
            echo json_encode(['status' => 'success', 'message' => 'FAQ deleted successfully.']);
        } catch (Exception $e) {
            http_response_code(500);
            echo json_encode(['status' => 'error', 'message' => $e->getMessage()]);
        }
    }

    /**
     * Get FAQ Categories (READ)
     */
    public function getCategories()
    {
        try {
            $search = trim($_GET['search'] ?? '');
            $query = "SELECT c.*, (SELECT COUNT(*) FROM faqs f WHERE f.category_name = c.name) as faq_count FROM faq_categories c WHERE 1=1";
            $params = [];

            if (!empty($search)) {
                $query .= " AND (c.name LIKE :s OR c.description LIKE :s)";
                $params[':s'] = "%$search%";
            }

            $query .= " ORDER BY c.id DESC";

            $stmt = $this->db->prepare($query);
            $stmt->execute($params);
            $categories = $stmt->fetchAll(PDO::FETCH_ASSOC);

            http_response_code(200);
            echo json_encode(['status' => 'success', 'data' => $categories]);
        } catch (Exception $e) {
            http_response_code(500);
            echo json_encode(['status' => 'error', 'message' => $e->getMessage()]);
        }
    }

    /**
     * Create FAQ Category (CREATE)
     */
    public function createCategory()
    {
        try {
            $input = json_decode(file_get_contents('php://input'), true) ?? $_POST;
            $name = trim($input['name'] ?? '');
            $description = trim($input['description'] ?? '');

            if (empty($name)) {
                http_response_code(400);
                echo json_encode(['status' => 'error', 'message' => 'Category Name is required.']);
                return;
            }

            $stmt = $this->db->prepare("INSERT INTO faq_categories (name, description) VALUES (:name, :desc)");
            $stmt->execute([
                ':name' => $name,
                ':desc' => $description
            ]);

            http_response_code(201);
            echo json_encode(['status' => 'success', 'message' => 'Category created successfully.']);
        } catch (Exception $e) {
            http_response_code(500);
            echo json_encode(['status' => 'error', 'message' => $e->getMessage()]);
        }
    }

    /**
     * Update FAQ Category (UPDATE)
     */
    public function updateCategory()
    {
        try {
            $input = json_decode(file_get_contents('php://input'), true) ?? $_POST;
            $id = (int)($input['id'] ?? 0);
            $name = trim($input['name'] ?? '');
            $description = trim($input['description'] ?? '');

            if ($id <= 0 || empty($name)) {
                http_response_code(400);
                echo json_encode(['status' => 'error', 'message' => 'Category ID and Name are required.']);
                return;
            }

            $stmt = $this->db->prepare("UPDATE faq_categories SET name = :name, description = :desc WHERE id = :id");
            $stmt->execute([
                ':name' => $name,
                ':desc' => $description,
                ':id' => $id
            ]);

            http_response_code(200);
            echo json_encode(['status' => 'success', 'message' => 'Category updated successfully.']);
        } catch (Exception $e) {
            http_response_code(500);
            echo json_encode(['status' => 'error', 'message' => $e->getMessage()]);
        }
    }

    /**
     * Delete FAQ Category (DELETE)
     */
    public function deleteCategory()
    {
        try {
            $input = json_decode(file_get_contents('php://input'), true) ?? $_POST;
            $id = (int)($input['id'] ?? $_GET['id'] ?? 0);

            if ($id <= 0) {
                http_response_code(400);
                echo json_encode(['status' => 'error', 'message' => 'Invalid category ID.']);
                return;
            }

            $stmt = $this->db->prepare("DELETE FROM faq_categories WHERE id = :id");
            $stmt->execute([':id' => $id]);

            http_response_code(200);
            echo json_encode(['status' => 'success', 'message' => 'Category deleted successfully.']);
        } catch (Exception $e) {
            http_response_code(500);
            echo json_encode(['status' => 'error', 'message' => $e->getMessage()]);
        }
    }
}
