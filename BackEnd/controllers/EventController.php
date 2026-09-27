<?php

require_once __DIR__ . '/../models/Event.php';

class EventController
{
    private $eventModel;

    public function __construct($db)
    {
        $this->eventModel = new Event($db);
    }

    /**
     * Get list of events (GET or POST)
     */
    public function getEvents()
    {
        $status = $_GET['status'] ?? $_POST['status'] ?? 'all';

        $rawInput = file_get_contents('php://input');
        if (!empty($rawInput)) {
            $json = json_decode($rawInput, true);
            if (is_array($json) && isset($json['status'])) {
                $status = $json['status'];
            }
        }

        $events = $this->eventModel->getAll($status);

        http_response_code(200);
        echo json_encode([
            'status' => 'success',
            'data' => $events
        ]);
    }

    /**
     * Create a new event
     */
    public function createEvent()
    {
        $input = json_decode(file_get_contents('php://input'), true);
        if (!$input) {
            $input = $_POST;
        }

        $eventName = trim($input['eventName'] ?? $input['event_name'] ?? '');
        $organizer = trim($input['organizer'] ?? $input['eventOrganizer'] ?? '');
        $eventDate = trim($input['eventDate'] ?? $input['event_date'] ?? '');
        $startTime = trim($input['startTime'] ?? $input['start_time'] ?? '');
        $endTime = trim($input['endTime'] ?? $input['end_time'] ?? '');
        $venue = trim($input['venue'] ?? $input['eventVenue'] ?? '');
        $expectedAttendees = intval($input['expectedAttendees'] ?? $input['expected_attendees'] ?? 0);
        $contactNumber = trim($input['contactNumber'] ?? $input['eventContact'] ?? '');
        $description = trim($input['description'] ?? $input['eventDescription'] ?? '');

        if (empty($eventName) || empty($organizer) || empty($eventDate) || empty($venue)) {
            http_response_code(400);
            echo json_encode([
                'status' => 'error',
                'message' => 'Event Name, Organizer, Date, and Venue are required.'
            ]);
            return;
        }

        $eventId = $this->eventModel->create(
            $eventName,
            $organizer,
            $eventDate,
            $startTime,
            $endTime,
            $venue,
            $expectedAttendees,
            $contactNumber,
            $description
        );

        if ($eventId) {
            http_response_code(201);
            echo json_encode([
                'status' => 'success',
                'message' => 'Event registered successfully.',
                'event_id' => $eventId
            ]);
        } else {
            http_response_code(500);
            echo json_encode([
                'status' => 'error',
                'message' => 'Failed to register event.'
            ]);
        }
    }

    /**
     * Update an existing event
     */
    public function updateEvent()
    {
        $input = json_decode(file_get_contents('php://input'), true);
        if (!$input) {
            $input = $_POST;
        }

        $id = intval($input['id'] ?? 0);
        $eventName = trim($input['eventName'] ?? $input['event_name'] ?? '');
        $organizer = trim($input['organizer'] ?? $input['eventOrganizer'] ?? '');
        $eventDate = trim($input['eventDate'] ?? $input['event_date'] ?? '');
        $startTime = trim($input['startTime'] ?? $input['start_time'] ?? '');
        $endTime = trim($input['endTime'] ?? $input['end_time'] ?? '');
        $venue = trim($input['venue'] ?? $input['eventVenue'] ?? '');
        $expectedAttendees = intval($input['expectedAttendees'] ?? $input['expected_attendees'] ?? 0);
        $contactNumber = trim($input['contactNumber'] ?? $input['eventContact'] ?? '');
        $description = trim($input['description'] ?? $input['eventDescription'] ?? '');
        $status = trim($input['status'] ?? 'upcoming');

        if (!$id || empty($eventName) || empty($organizer) || empty($eventDate) || empty($venue)) {
            http_response_code(400);
            echo json_encode([
                'status' => 'error',
                'message' => 'Event ID, Name, Organizer, Date, and Venue are required.'
            ]);
            return;
        }

        $success = $this->eventModel->update(
            $id,
            $eventName,
            $organizer,
            $eventDate,
            $startTime,
            $endTime,
            $venue,
            $expectedAttendees,
            $contactNumber,
            $description,
            $status
        );

        if ($success) {
            http_response_code(200);
            echo json_encode([
                'status' => 'success',
                'message' => 'Event updated successfully.'
            ]);
        } else {
            http_response_code(500);
            echo json_encode([
                'status' => 'error',
                'message' => 'Failed to update event.'
            ]);
        }
    }

    /**
     * Delete an event
     */
    public function deleteEvent()
    {
        $input = json_decode(file_get_contents('php://input'), true);
        if (!$input) {
            $input = $_REQUEST;
        }

        $id = intval($input['id'] ?? 0);

        if (!$id) {
            http_response_code(400);
            echo json_encode([
                'status' => 'error',
                'message' => 'Valid Event ID is required.'
            ]);
            return;
        }

        $success = $this->eventModel->delete($id);

        if ($success) {
            http_response_code(200);
            echo json_encode([
                'status' => 'success',
                'message' => 'Event deleted successfully.'
            ]);
        } else {
            http_response_code(500);
            echo json_encode([
                'status' => 'error',
                'message' => 'Failed to delete event.'
            ]);
        }
    }
}
