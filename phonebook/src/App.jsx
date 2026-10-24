import { useState, useEffect } from 'react'
import phonebookService from './services/phonebook'
import Notification from './components/Notification'
import './index.css'

const Names = ({name, number, deleteContact}) => {
  return(
      <li>
        {name} {number}
        <button onClick={deleteContact}>delete</button>
      </li> 
  )
}

const Filter = (props) => {
  return(
      <div>
        filter shown with <input value={props.search}
          onChange={props.handleSearch}/>
      </div>
  )
}

const PersonForm = (props) => {
  return(
    <form onSubmit={props.addNumber}>
      <div>
        name: <input value={props.newName}
              onChange={props.handleNameChange} />
      </div>
      <div>
        number: <input value={props.newNumber}
        onChange={props.handleNumberChange} />
      </div>
      <div>
        <button type="submit">add</button>
      </div>
    </form>
  )
}

const Persons = (props) => {
  return (
    <div>
      <ul>
        {props.filteredPersons.map(person => 
          <Names key={person.id} name={person.name} number={person.number}
            deleteContact={() => props.deleteContact(person.id)} />
        )}
      </ul>
    </div>
  )
}


const App = () => {
  const [persons, setPersons] = useState([])
  const [newName, setNewName] = useState('')
  const [newNumber, setNewNumber] = useState('')
  const [search, setSearch] = useState('')
  const [message, setMessage] = useState(null)
  const [messageType, setMessageType] = useState('success')

  useEffect(() => {
    phonebookService
    .getAll()
    .then(initalPersons =>
      setPersons(initalPersons)
    )
  }, [])

  const addNumber = (event) => {
    event.preventDefault()

    const existingPerson = persons.find
    (person => person.name.toLowerCase() === newName.toLowerCase()) 
    
    if (existingPerson 
        && 
        window.confirm(`${newName} is already added to phonebook, replace the old number with a new one`))
        {
          const changedNumber = {...existingPerson, number: newNumber }
          phonebookService
          .update(existingPerson.id, changedNumber)
          .then(returnedContact => {
            setPersons(persons.map(person => person.id === existingPerson.id ? returnedContact : person))
          })
          .catch(error => {
            setMessage(
              `Information of ${existingPerson.name} was already removed from the server`
            )
            setMessageType('error')
            setTimeout(() => {
              setMessage(null)
            }, 5000)
          })
        }

    if(!existingPerson)
    {
      const Contact = {
        name: newName,
        number: newNumber
      }
  
      phonebookService.
      create(Contact)
      .then(returnedContact => {
        setPersons(persons.concat(returnedContact))
        setNewName('')
        setNewNumber('')

        setMessage(`${returnedContact.name} added to phonebook`)
        setMessageType('success')
        setTimeout(() => {
          setMessage(null)
        }, 5000);
      })

    }
  }

  const handleNameChange = (event) => {
    setNewName(event.target.value)
  }

  const handleNumberChange = (event) => {
    setNewNumber(event.target.value)
  }

  const handleSearch = (event) => {
    setSearch(event.target.value)
  }

  const filteredPersons = persons.filter(person => 
    person.name.toLowerCase().includes(search.toLowerCase())
  )

  const deleteContactOf = (id) => {
    const contact = persons.find(n => n.id === id)
    
    if(window.confirm(`Delete ${contact.name}?`))
    {
      phonebookService
        .del(contact.id)
        .then(() => {
          setPersons(persons.filter(n => n.id !== id))
        })
    }
  }


  return (
    <div>
      
      <h2>Phonebook</h2>
      <Notification message={message} messageType={messageType} />
      <Filter search={search} handleSearch={handleSearch}/>
      <h2>Add a new</h2>
      <PersonForm addNumber={addNumber} newName={newName} 
        handleNameChange={handleNameChange} newNumber={newNumber} 
        handleNumberChange={handleNumberChange} />
      <h2>Numbers</h2>
      <Persons deleteContact={deleteContactOf} filteredPersons={filteredPersons}/>
    </div>
  )
}

export default App