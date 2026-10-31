const mongoose = require('mongoose')

if (process.argv.length < 3) {
  console.log('give password as argument')
  process.exit(1)
}

const password = process.argv[2]

const url = `mongodb+srv://med-fullstack-open:${password}@cluster0.tslj1do.mongodb.net/phonebookApp?
retryWrites=true&w=majority&appName=Cluster0`

mongoose.set('strictQuery',false)

mongoose.connect(url, { family: 4 })

const personSchema = new mongoose.Schema({
  id: String,
  name: String,
  number: String
})

const Person = mongoose.model('Person', personSchema)

const personNameCmd = process.argv[3]
const personNumberCmd = process.argv[4]

const person = new Person({
  id: generateId(),
  name: personNameCmd,
  number: personNumberCmd
})


// person.save().then(result => {
//   console.log(`Added ${personNameCmd} number ${personNumberCmd} to phonebook`)
//   mongoose.connection.close()
// })

Person.find({}).then(result => {
  result.forEach(person => {
    console.log(person)
  })
  mongoose.connection.close()
})