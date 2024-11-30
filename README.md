# **Backend SegurosOrt**

## **Descripción**

Este es el backend de la aplicación desarrollado con **Node.js** con **express**

## **Requisitos previos**

1. **Node.js** (versión mínima recomendada: `20.12.2`).
2. **npm** como gestor de paquetes.
3. Tener configuradas las variables de entorno.

## **Instalación**

1. Clona el repositorio:
   ```bash
   git clone url_del_repositorio
   ```
2. Entra al directorio del repositorio:
   ```bash
   cd tu-repositorio
   ```
3. Instalar las dependencias:
   ```bash
   npm install
   ```

## **Configuración**

1. Creá un archivo .env en la raíz del proyecto y configurá las siguientes variables:

```bash
MONGODB = url-base-de-datos-en-mongo
PORT = puerto
CLAVE_SECRETA = tu-clave-secreta
DATABASE = "seguros"
USERS_COLECCTION = "users"
POLIZAS_COLECCTION = "polizas"
SOLICITUDES_COLECCTION = "solicitudes"
API_SEND_EMAIL = url-de-api-send-emails
TOKEN_EMAIL = token-estatico (debe coincidir con la de Api de envío de emails)
```

## **Uso**

```bash
npm start dev
```

## **Tecnologías utilizadas**

Este proyecto utiliza las siguientes tecnologías y dependencias:

### **Dependencias**

- **Express**
- **Axios**
- **Bcryptjs**
- **Cors**
- **Dotenv**
- **Jsonwebtoken**
- **Joi**
- **Mongodb**
- **Handlebars**
- **Html-pdf**
- **Validator**

### **Versiones**

- **Express**: `4.19.2`
- **Axios**: `1.7.7`
- **Bcryptjs**: `2.4.3`
- **Jsonwebtoken**: `9.0.2`
- **Mongodb**: `6.6.1`
- **Dotenv**: `16.4.5`
- **Nodemon**: `3.1.7`
- **Html-pdf**: `3.0.1`
- **Joi**: `17.13.3`
- **Validator**: `13.12.0`
