<?php

    // require_once 'index.php';
    $request_method = $_SERVER['REQUEST_METHOD'];
    $request_JSON = file_get_contents('php://input');
    $request_data = json_decode($request_JSON, true);

    function send_JSON( $data, $status_code = 200)
{
    header( "Content-Type: application/json");
    http_response_code( $status_code);
    $json = json_encode( $data);
    echo $json;
    exit();
}

    if( $request_method != 'POST')
    {
        send_JSON( 'Invalid Method', 405);
    }

    if( !isset( $request_data[ 'entity']) || !isset( $request_data[ 'fields'])) 
    {
        send_JSON( 'Missing Keys', 400);
    }


    $entity = $request_data[ 'entity'];
    $fields = $request_data[ 'fields'];
    // $columns = $request_data[ 'columns'];


    
    if( !file_exists("../db/$entity.csv")) 
    {
        file_put_contents( "../db/$entity.csv", '');
    }
    // send_JSON( $entity);

    $fp = fopen("../db/$entity.csv", 'a');

    foreach ($fields as $field) 
    {
        fputcsv($fp, $field);
    }

    fclose($fp);


    send_JSON( 'done');
?>
