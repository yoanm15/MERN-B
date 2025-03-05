import React from 'react';

interface UserData {
  id: string;
  firstName: string;
  lastName: string;
}

const LoggedInName: React.FC = () => {
  const _ud = localStorage.getItem('user_data');
  if (!_ud) {
    // Handle case where user data isn't found (optional)
    return null; // or redirect to login
  }
  
  const ud = JSON.parse(_ud) as UserData;
  const { firstName, lastName } = ud;

  const doLogout = (event: React.MouseEvent<HTMLButtonElement>) => {
    event.preventDefault();
    localStorage.removeItem("user_data");
    window.location.href = '/';
  };    

  return (
    <div id="loggedInDiv">
      <span id="userName">Logged In As {firstName} {lastName}</span><br />
      <button
        type="button"
        id="logoutButton"
        className="buttons"
        onClick={doLogout}
      >
        Log Out
      </button>
    </div>
  );
};

export default LoggedInName;