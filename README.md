# Ciklum OfficeSpace
Final project for Ciklum JS Internship

This is a full-stack application based on [MEAN stack](http://mean.io/).

The application is deployed with Heroku [here](http://ciklumspace.herokuapp.com). Database is deployed using [mLab](https://mlab.com).

The aim of the application is to help with searching of a exact employee in multi-floor office.

---

##### Instructions
- as admin/user you can search employees using the search panel
- as admin/user you can see employee details in the popup
- as user you can login/signup
- as admin you can create a new seat on any floor, using 'draw' mode
- as admin you can edit seat details in the popup (id is obligatory and unique, title is optional)
- as admin you can unset employee from a busy seat, clicking on the cross icon in popup
- as admin you can attach any employee to a free seat, clicking on an employee in popup search list or using 'selection' mode from employee details modal window. If the employee occupies another seat, he will lose it and get new one
- as admin you can drag seat on the floor
- as admin you can remove seat from the floor. If there is an occupant, he will lose a seat.
- as admin you can create/remove floor configuration on admin page

---

##### Features
- secure authorisation
- adaptive design
- multi-floors configuration
- browser-side input data validation
- server-side input data validation


---

##### List of used technologies:
- express
- mongodb (with mongoose)
- passport.js
- ES6 (with Babel)
- Angular
- jQuery
- webpack
- jade
- sass

---

##### To run the project locally, use:
```
git clone https://github.com/AlexMarvelo/ciklum-officespace.git
cd ciklum-officespace
git checkout dev
npm i
mongod
npm start
```
Then open *http://localhost:3000* in your browser

![Application screenshot](http://heyalex.xyz/static/img/screenshot-ciklumspace.png)
