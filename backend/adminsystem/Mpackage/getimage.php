<?php
if (!isset($_GET['file'])) {
    http_response_code(400);
    exit('No file specified');
}

$file = basename($_GET['file']); 
$path = __DIR__ . '/packagepics/' . $file;

if (!file_exists($path)) {
    http_response_code(404);
    exit('File not found');
}

$info = pathinfo($path);
$ext = strtolower($info['extension']);
$mime = match($ext) {
    'jpg', 'jpeg' => 'image/jpeg',
    'png' => 'image/png',
    'gif' => 'image/gif',
    default => 'application/octet-stream',
};

header('Content-Type: ' . $mime);
readfile($path);