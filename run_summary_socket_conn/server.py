import socket
from threading import Thread
import requests
import json

SERVER = ''
PORT = 3502
ADDR = (SERVER, PORT)
BUFF_SIZE = 4096

ACCESS_TOKEN_URL = "https://ap-southeast-2.aws.realm.mongodb.com/api/client/v2.0/app/application-0-uarzy/auth/providers/anon-user/login"
ADD_RUN_SUMMARY_URL = "https://ap-southeast-2.aws.data.mongodb-api.com/app/application-0-uarzy/endpoint/add_run_summary"
POST_METHOD = "POST"

server = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
server.setsockopt(socket.SOL_SOCKET, socket.SO_REUSEADDR, 1)
server.bind(ADDR)


def get_access_token():
   global access_token 
   access_token = requests.request(POST_METHOD, ACCESS_TOKEN_URL).json()['access_token']

def save_run_summary_data(payload, retry = False):
    response = requests.request(POST_METHOD, ADD_RUN_SUMMARY_URL, 
                                headers={'Authorization': f'Bearer {access_token}'}, data=payload)
    
    if (response.status_code == 401 and retry == False):
        get_access_token()
        save_run_summary_data(payload, True)
    else:
        print(response.text)


def handle_client(sc, addr):
    print(f"NEW CONNECTION {addr} Connected")
    data = b""
    
    while True:
        chunk = sc.recv(BUFF_SIZE)
        if not chunk:
            break
        data += chunk
        
    payload = json.dumps(json.loads(data.decode()))
    print("Received data: making api call")
    save_run_summary_data(payload)
    sc.close()


def start():
    print('[SERVER STARTED]!')
    server.listen()
    get_access_token()
    while True:
        sc, addr = server.accept()
        thread = Thread(target=handle_client, args=(sc, addr))
        thread.start()


start()