
# OLX EXAMPLE API

It was developed during the NodeJS course at B7WEB.com.br



## Installation

Install API with npm

```bash
  npm install

  MongoDB structure in db_structure.txt

  npm run dev
```
    
## API Reference

#### Get all states

```http
  GET /states
```

| Parameter | Type     | Description                |
| :-------- | :------- | :------------------------- |
| `token` | `string` | **optional**|

#### Post SignIn

```http
  POST /user/signin
```

| Parameter | Type     | Description                       |
| :-------- | :------- | :-------------------------------- |
| `name`         | `string` | **Required**. > 2 characters|
| `email`        | `string` | **Required**. -> is e-mail|
| `passwordHash` | `string` | **Required**. > 2 characters|
| `state`        | `string` | **Required**. > 2 characters|

#### Post SignUp

```http
  POST /user/signup
```

| Parameter | Type     | Description                       |
| :-------- | :------- | :-------------------------------- |
| `name`         | `string` | **Required**. > 2 characters|
| `email`        | `string` | **Required**. -> is e-mail|
| `passwordHash` | `string` | **Required**. > 2 characters|
| `state`        | `string` | **Required**. > 2 characters|


#### Get User
```http
  GET /user/me
```

| Parameter | Type     | Description                |
| :-------- | :------- | :------------------------- |
| `token` | `string` | **Required**|  

#### Put User
```http
  PUT /user/me
```

| Parameter | Type     | Description                |
| :-------- | :------- | :------------------------- |
| `token`        | `string` | **Required**|  
| `name`         | `string` | **optional**. > 2 characters|
| `email`        | `string` | **optional**. -> is e-mail|
| `passwordHash` | `string` | **optional**. > 2 characters|
| `state`        | `string` | **optional**. > 2 characters|

#### Get Categories
```http
  GET /categories
```

| Parameter | Type     | Description                |
| :-------- | :------- | :------------------------- |
| `token` | `string` | **optional**|  

#### Get Ads
```http
  GET /ad/list
```

| Parameter | Type     | Description                |
| :-------- | :------- | :------------------------- |
| `token` | `string` | **optional**|

#### Get Ad
```http
  GET /ad/:id
```

| Parameter | Type     | Description                |
| :-------- | :------- | :------------------------- |
| `id` | `string` | **Required**| 




## 🔗 Links
[![portfolio](https://img.shields.io/badge/my_portfolio-000?style=for-the-badge&logo=ko-fi&logoColor=white)](https://github.com/AntonioEdinadson)
[![linkedin](https://img.shields.io/badge/linkedin-0A66C2?style=for-the-badge&logo=linkedin&logoColor=white)](https://www.linkedin.com/in/ant%C3%B4nio-edinadson-gomes-eug%C3%AAnio-863498130/)

  