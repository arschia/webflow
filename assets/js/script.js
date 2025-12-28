// ===== 1) Helpers =====
const $ = (id) => document.getElementById(id)
const isEmail = (v) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v)

function setRule(el, ok) {
  el.classList.remove('valid', 'invalid')
  el.classList.add(ok ? 'valid' : 'invalid')
}

// Elements 
const tabs = document.querySelectorAll('.tab')

const formUp = $('registerForm')
const formIn = $('loginForm')

const upUser = $('username')
const upName = $('fullName')
const upMail = $('email')
const upPass = $('password')
const upBtn = $('registerBtn')

const inMail = $('loginEmail')
const inPass = $('loginPassword')
const inBtn = $('loginBtn')

const errUser = $('usernameError')
const errName = $('fullNameError')
const errMail = $('emailError')

const upOk = $('successMessage')
const inOk = $('loginSuccess')
const inBad = $('loginError')

// Password rule elements
const rStrength = $('ruleStrength')
const strengthText = $('strengthLabel')
const rNoNameEmail = $('ruleNoNameEmail')
const rMinLen = $('ruleMinLength')
const rNumSym = $('ruleNumberSymbol')

//  Tabs 
tabs.forEach((t, i) => {
  t.addEventListener('click', () => {
    tabs.forEach((x) => x.classList.remove('active'))
    t.classList.add('active')

    if (i === 0) {
      formUp.classList.add('active')
      formIn.classList.remove('active')
    } else {
      formUp.classList.remove('active')
      formIn.classList.add('active')
    }
  })
})

// Password rules 
function containsNameOrEmail(pwd, fullName, email) {
  const p = pwd.toLowerCase()

  // تکه‌های نام
  const nameParts = fullName
    .toLowerCase()
    .split(/\s+/)
    .filter((x) => x.length > 1)

  // تکه‌های ایمیل
  const e = email.toLowerCase()
  const local = e.split('@')[0] || ''
  const emailParts = [local, ...e.split(/[.@_+\-]/)].filter((x) => x.length > 1)

  return [...nameParts, ...emailParts].some((part) => p.includes(part))
}

function checkPasswordRules() {
  const pwd = upPass.value
  const fullName = upName.value.trim()
  const email = upMail.value.trim()


  if (!pwd) {
    ;[rMinLen, rNumSym, rNoNameEmail, rStrength].forEach((el) => el.classList.remove('valid', 'invalid'))
    strengthText.textContent = 'Weak'
    return { ok: false, score: 0 }
  }

  const minLenOk = pwd.length >= 8
  const hasNumber = /\d/.test(pwd)
  const hasSymbol = /[!@#$%^&*()\-_=+[{\]}\\|;:'",<.>/?`~]/.test(pwd)
  const numOrSymOk = hasNumber || hasSymbol

  const hasNameEmail = (fullName || email) ? containsNameOrEmail(pwd, fullName, email) : false
  const noNameEmailOk = !hasNameEmail

  setRule(rMinLen, minLenOk)
  setRule(rNumSym, numOrSymOk)
  setRule(rNoNameEmail, noNameEmailOk)

  // Strength
  let score = 0
  if (minLenOk) score++
  if (numOrSymOk) score++
  if (noNameEmailOk) score++
 

  let s = 'Weak'
  if (score === 3 && pwd.length >= 10) s = 'Strong'
  else if (score >= 2) s = 'Medium'
  strengthText.textContent = s

  const allOk = minLenOk && numOrSymOk && noNameEmailOk
  setRule(rStrength, allOk)

  return { ok: allOk, score }
}

// Sign Up validation 
function checkUp() {
  const u = upUser.value.trim()
  const n = upName.value.trim()
  const e = upMail.value.trim()

  let ok = true

  // username
  if (u.length < 3 || u.length > 15 || !/^[a-zA-Z0-9]+$/.test(u)) {
    errUser.textContent = 'Username: 3–15 and only letters/numbers.'
    ok = false
  } else errUser.textContent = ''

  // full name
  const parts = n.split(/\s+/).filter(Boolean)
  if (parts.length < 2) {
    errName.textContent = 'Enter full name (first + last).'
    ok = false
  } else errName.textContent = ''

  // email
  if (!isEmail(e)) {
    errMail.textContent = 'Enter a valid email.'
    ok = false
  } else errMail.textContent = ''

  // password rules 
  const pwdState = checkPasswordRules()
  if (!pwdState.ok) ok = false

  upBtn.disabled = !ok
  return ok
}


;[upUser, upName, upMail, upPass].forEach((inp) => inp.addEventListener('input', checkUp))

// Submit Sign Up
formUp.addEventListener('submit', (ev) => {
  ev.preventDefault()
  if (!checkUp()) return

  const user = {
    username: upUser.value.trim(),
    fullName: upName.value.trim(),
    email: upMail.value.trim(),
    password: upPass.value 
  }

  localStorage.setItem('simpleflowUser', JSON.stringify(user))
  show(upOk)

  formUp.reset()
  checkUp()
})

// ===== 6) Sign In =====
function checkInBtn() {
  inBtn.disabled = !(inMail.value.trim() && inPass.value)
}

inMail.addEventListener('input', checkInBtn)
inPass.addEventListener('input', checkInBtn)

formIn.addEventListener('submit', (ev) => {
  ev.preventDefault()

  hide(inOk)
  hide(inBad)

  const saved = JSON.parse(localStorage.getItem('simpleflowUser'))
  const e = inMail.value.trim()
  const p = inPass.value

  if (!saved) {
    inBad.textContent = 'No account found. Please sign up first.'
    show(inBad)
    return
  }

  if (saved.email === e && saved.password === p) {
    inOk.textContent = `Welcome, ${saved.fullName}!`
    show(inOk)
  } else {
    inBad.textContent = 'Incorrect email or password'
    show(inBad)
  }
})

// init
checkUp()
checkInBtn()
