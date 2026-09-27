<?php

// Set JSON headers and CORS headers
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json; charset=UTF-8");
header("Access-Control-Allow-Methods: POST, GET, OPTIONS, PUT, DELETE");
header("Access-Control-Max-Age: 3600");
header("Access-Control-Allow-Headers: Content-Type, Access-Control-Allow-Headers, Authorization, X-Requested-With");

if (($_SERVER['REQUEST_METHOD'] ?? 'GET') === 'OPTIONS') {
    http_response_code(200);
    exit();
}

require_once __DIR__ . '/config/Database.php';
require_once __DIR__ . '/controllers/AuthController.php';
require_once __DIR__ . '/controllers/UserController.php';
require_once __DIR__ . '/controllers/SupportController.php';
require_once __DIR__ . '/controllers/TaskController.php';
require_once __DIR__ . '/controllers/EventController.php';
require_once __DIR__ . '/controllers/VisitorRequestController.php';

// Initialize Database connection
$database = new Database();
$db = $database->connect();

if (!$db) {
    http_response_code(500);
    echo json_encode([
        'status' => 'error',
        'message' => 'Database connection failed.'
    ]);
    exit();
}

// Instantiate Controllers
$authController = new AuthController($db);
$userController = new UserController($db);
$supportController = new SupportController($db);
$taskController = new TaskController($db);
$eventController = new EventController($db);
$visitorRequestController = new VisitorRequestController($db);

// Determine route action
$action = $_GET['action'] ?? $_POST['action'] ?? '';

// Check JSON body for action parameter if not in $_GET or $_POST
if (empty($action)) {
    $rawInput = file_get_contents('php://input');
    if (!empty($rawInput)) {
        $jsonInput = json_decode($rawInput, true);
        if (is_array($jsonInput) && isset($jsonInput['action'])) {
            $action = $jsonInput['action'];
        }
    }
}

// Router dispatch
switch ($action) {
    // Auth Routes
    case 'login':
        $authController->login();
        break;

    case 'logout':
        $authController->logout();
        break;

    case 'check_auth':
        $authController->checkAuth();
        break;

    // User Management Routes
    case 'add_user':
        $userController->addUser();
        break;

    case 'get_users':
        $userController->getUsers();
        break;

    case 'update_user':
        $userController->updateUser();
        break;

    case 'delete_user':
        $userController->deleteUser();
        break;

    // Support System Routes
    case 'get_support_stats':
        $supportController->getStats();
        break;

    case 'get_tickets':
        $supportController->getTickets();
        break;

    case 'create_ticket':
        $supportController->createTicket();
        break;

    case 'update_ticket':
        $supportController->updateTicket();
        break;

    case 'delete_ticket':
        $supportController->deleteTicket();
        break;

    case 'get_faqs':
        $supportController->getFaqs();
        break;

    case 'create_faq':
        $supportController->createFaq();
        break;

    case 'update_faq':
        $supportController->updateFaq();
        break;

    case 'delete_faq':
        $supportController->deleteFaq();
        break;

    case 'get_faq_categories':
        $supportController->getCategories();
        break;

    case 'create_faq_category':
        $supportController->createCategory();
        break;

    case 'update_faq_category':
        $supportController->updateCategory();
        break;

    case 'delete_faq_category':
        $supportController->deleteCategory();
        break;

    // Task Directives Routes (OIC & JSO Task Subsystem)
    case 'get_tasks':
        $taskController->getTasks();
        break;

    case 'get_jsos':
        $taskController->getJsos();
        break;

    case 'create_task':
        $taskController->createTask();
        break;

    case 'update_task_status':
        $taskController->updateTaskStatus();
        break;

    case 'delete_task':
        $taskController->deleteTask();
        break;

    // Manage Events Routes (University Management Subsystem)
    case 'get_events':
        $eventController->getEvents();
        break;

    case 'create_event':
        $eventController->createEvent();
        break;

    case 'update_event':
        $eventController->updateEvent();
        break;

    case 'delete_event':
        $eventController->deleteEvent();
        break;

    // Visitor Requests Routes (Visitor & Security Management Subsystem)
    case 'get_visitor_requests':
        $visitorRequestController->getVisitorRequests();
        break;

    case 'create_visitor_request':
        $visitorRequestController->createVisitorRequest();
        break;

    case 'update_visitor_status':
        $visitorRequestController->updateVisitorStatus();
        break;

    default:
        http_response_code(404);
        echo json_encode([
            'status' => 'error',
            'message' => 'API Endpoint action not found.'
        ]);
        break;
}
