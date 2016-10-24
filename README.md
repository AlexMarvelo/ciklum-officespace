# Ciklum-officespace
Final project for Ciklum JS Internship

This is a full-stack application based on [MEAN stack](http://mean.io/).
It can fetch data from local database (there are only 3 'World War Z' films).
If there are no results from local base, it uses [remote database](http://www.omdbapi.com/).
Fetching data is available only after authorization via email and password.
User can add/remove movies to favourites list and add comments on single movie page. User can delete only his own comments.

Application deployed on [Heroku server](). Database is deployed using [mLab](https://mlab.com).

---

##### List of used technologies:
- express
- mongodb (with mongoose)
- passport.js
- ES6 (with Babel)
- Angular
- webpack
- jade

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
Then open *http://localhost:3000/* in your browser

![Application screenshot]()
