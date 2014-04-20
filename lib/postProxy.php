<?php

$url = $_POST['url'];
$postvars = $_POST['data'];

$session = curl_init($url);

curl_setopt ($session, CURLOPT_POST, true);
curl_setopt ($session, CURLOPT_POSTFIELDS, $postvars);
curl_setopt ($session, CURLOPT_HTTPHEADER, array('Content-Type: text/xml'));
curl_setopt ($session, CURLOPT_FOLLOWLOCATION, true); 
curl_setopt ($session, CURLOPT_RETURNTRANSFER, true);

$response = curl_exec($session);
echo $response;

curl_close($session);

?>