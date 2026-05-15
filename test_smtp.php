<?php
$host = 'smtp.gmail.com';
$port = 587;
echo "Testing connection to $host:$port...\n";
$sock = @fsockopen($host, $port, $errno, $errstr, 5);
if ($sock) {
    echo "OK: Connection established\n";
    fclose($sock);
} else {
    echo "FAILED: $errstr ($errno)\n";
}
