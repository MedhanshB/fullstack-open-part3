require('dotenv').config()
const express = require('express')
const app = express()
var morgan = require('morgan')

const Person = require('./models/person')

morgan.token('request-body', (req, res) => {
  return JSON.stringify(req.body)
})

requestLogger = morgan(':method :url - :response-time ms :request-body')

app.use(express.static('dist'))
app.use(express.json())
app.use(requestLogger)


// let persons = [
//     { 
//       "id": "1",
//       "name": "Arto Hellas", 
//       "number": "040-123456"
//     },
//     { 
//       "id": "2",
//       "name": "Ada Lovelace", 
//       "number": "39-44-5323523"
//     },
//     { 
//       "id": "3",
//       "name": "Dan Abramov", 
//       "number": "12-43-234345"
//     },
//     { 
//       "id": "4",
//       "name": "Mary Poppendieck", 
//       "number": "39-23-6423122"
//     }
// ]
// const generateId = () => {
//   const id = Math.floor(Math.random() * 100000)
//   return id
// }

app.get('/api/persons', (request, response) => {
  Person.find({}).then(persons => {
    response.json(persons)
  })
})

app.get('/info', (request, response) => {
    const currentTime = new Date().toString();
    const personsNumber = persons.length

    response.send(`
        <p> Phonebook has info for ${personsNumber}</p>
        <p>${currentTime}</p>
        `)
})

app.get('/api/persons/:id', (request, response, next) => {
  Person.findById(request.params.id)
    .then(person => {
      if (person) {
        response.json(person)
      } else {
        response.status(404).end()
      }
    })
    .catch(error => next(error))
})

app.delete('/api/persons/:id', (request, response, next) => {
  Person.findByIdAndDelete(request.params.id)
    .then(result => {
      response.status(204).end()
    })
    .catch(error => next(error))
})

app.post('/api/persons', (request, response, next) => {
  const body = request.body

  if (!body.name || !body.number) {
    return response.status(400).json({ 
      error: 'Missing name or number'
    })
  }

  const name = body.name.trim()

  Person.findOne({ name: name })
    .then(existingPerson => {
      if (existingPerson) {
        return response.status(400).json({
          error: 'name must be unique'
        })
      }

      const person = new Person({
        name: name,
        number: body.number.trim(),
      })
    
      person.save().then(savedPerson => {
        response.json(savedPerson)
      })
      .catch(error => next(error))
    })
})

app.put('/api/persons/:id', (request, response, next) => {
  const { name, number } = request.body

  Person.findById(request.params.id)
    .then(person => {
      if (!person) {
        return response.status(404).end()
      }

      person.name = name
      person.number = number

      return person.save().then(updatedPerson => {
        response.json(updatedPerson)
      })
    })
    .catch(error => next(error))
})

const errorHandler = (error, request, response, next) => {
  console.error(error.message)

  if (error.name === 'CastError') {
    return response.status(400).send({ error: 'malformatted id' })
  } 
  else if (error.name === 'ValidationError') {
    return response.status(400).json({ error: error.message })
  }

  next(error)
}

// this has to be the last loaded middleware, also all the routes should be registered before this!
app.use(errorHandler)


const PORT = process.env.PORT
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})