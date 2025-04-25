/**
 * Modelo de dados dos dados dos clientes
 * Criação da coleção
 */

// importação dos recursos do moongose
const {model, Schema, version} = require('mongoose')

//criação da estrutura da criação
const clienteSchema = new Schema({
    nomeCli: {
        type: String
    },
    telCli: {
        type: String
    },
    nascCli:{
        type: String
    },
    emailCli: {
        type: String
    },
    cpfCli: {
        type: String,
        unique: true, //campo unico
        index: true //relaciona o cpf ao id
    },
    cepCli: {
        type: String
    },
    ruaCli: {
        type: String
    },
    NumCli: {
        type: String
    },
    complementoCli: {
        type: String
    },
    bairroCli: {
        type: String
    },
    cidadeCli: {
        type: String
    },
    ufCli: {
        type: String
    }

}, {versionKey: false})

//exportar o modelo de dados para o main
module.exports = model('Clientes', clienteSchema)