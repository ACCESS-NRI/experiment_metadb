import socket
import os
import sys

SERVER = ''
PORT = 3502
ADDR = (SERVER, PORT)
BUFF_SIZE = 4096

client = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
client.connect(ADDR)

filename = sys.argv[1]
f = open (filename, "rb")
l = f.read(BUFF_SIZE)
while (l):
    client.sendall(l)
    l = f.read(BUFF_SIZE)

client.shutdown()