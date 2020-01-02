import React, { Component } from 'react';
import './App.css';
import Auth from '@aws-amplify/auth';
import {
  Formiz,
  useForm,
  useField
} from '@formiz/core'

// 1. Create a reusable field
const MyField = (props) => {
  const {
    errorMessage,
    id,
    isValid,
    isPristine,
    isSubmitted,
    resetKey,
    setValue,
    value,
  } = useField(props)
  const { label, type, required } = props
  const [isFocused, setIsFocused] = React.useState(false);
  const showError = !isValid && (!isPristine || isSubmitted)

  return (
    <div className={`demo-form-group ${(showError && !isFocused) ? 'is-error' : ''}`}>
      <label
        className="demo-label"
        htmlFor={id}
      >
        { label }
        {required && ' *'}
      </label>
      <input
        key={resetKey}
        id={id}
        type={type || 'text'}
        value={value || ''}
        className="demo-input"
        onChange={e => setValue(e.target.value)}
        onFocus={() => setIsFocused(true)}
        onBlur={() => setIsFocused(false)}
        aria-invalid={!isValid}
        aria-describedby={!isValid ? `${id}-error` : null}
      />
      {showError && (
        <div id={`${id}-error`} className="demo-form-feedback">
          { errorMessage }
        </div>
      )}
    </div>
  )
}


// 2. Create a form with multi steps & fields
const MyForm = () => {
  const myForm = useForm()
  const [isLoading, setIsLoading] = React.useState(false)
  const submitForm = (values) => {
    setIsLoading(true)
    console.log(values.email);
    Auth.signIn({username:values.email, password:values.password})
    .then((data) => {
      console.log("data :" +data);
      /*this.props.history.push({
        pathname: '/signinconfirm',
        search: '',
        state: { email: email }
      });*/
      setIsLoading(false);
    })
    .catch((err) => {
      console.log("err :" +err.code);
      setIsLoading(false);
    })



    /*setTimeout(() => {
      setIsLoading(false)
      alert(JSON.stringify(values))
      myForm.invalidateFields({
        email: 'You can display an error after an API call',
      })
    }, 1000)*/
  }
  return (
    <Formiz onValidSubmit={submitForm} connect={myForm}>
      <form
        noValidate
        onSubmit={myForm.submit}
        className="demo-form"
        style={{ minHeight: '16rem' }}
      >
        <div className="demo-form__content">
      
            <MyField
              name="email"
              label="Email"
              type="email"
              required="Email is required"        
            />
          
            <MyField
              name="password"
              label="Password"
              type="password"
            />

        </div>

        <div className="demo-form__footer">
          <div
            className="ml-auto"
            style={{ minWidth: '6rem' }}
          >
            <button
              className="demo-button is-full is-primary"
              type="submit"
              disabled={isLoading || (!myForm.isValid && myForm.isSubmitted)}
            >
              {isLoading ? 'Loading...' : 'Submit'}
            </button>
          </div>
        </div>
      </form>
    </Formiz>
  )
}



class SignInUp extends Component {

  constructor(props) {
    super(props);
    this.state = {
      email: '',
      password: '',
      err: '',
      hName: Math.random(),
      hType:'hidden',
      hValue:'',
    };
    
    //this.handleChange = this.handleChange.bind(this);
    //this.handleSubmit = this.handleSubmit.bind(this);

  }

  render(){
    return (
  <MyForm />
  )
  }


}
export default SignInUp;
