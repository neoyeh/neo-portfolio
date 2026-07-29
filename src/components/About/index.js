import React from 'react';
import moment from 'moment';

function About() {
  const years = moment().diff('1991-08-08', 'years');

  return (
      <div className="protfolio-content">
          {years}
      </div>
  );
}

export default About;
