<?php

return [
    'paths' => ['api/*', 'graphql', 'sanctum/csrf-cookie'],
    'allowed_methods' => ['*'],
    'allowed_origins' => ['http://localhost:8000'],
    'allowed_headers' => ['*'],
    'supports_credentials' => true,
];
