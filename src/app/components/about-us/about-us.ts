import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
// Import specific icons
import { faShieldHalved, faUsers, faLightbulb } from '@fortawesome/free-solid-svg-icons';

@Component({
  selector: 'app-about-us',
  standalone: true,
  imports: [CommonModule, FontAwesomeModule], // Add FontAwesomeModule here
  templateUrl: './about-us.html',
  styleUrls: ['./about-us.css']
})
export class AboutUsComponent {
  // Mapping icons to variables
  faShield = faShieldHalved;
  faUsers = faUsers;
  faLightbulb = faLightbulb;

  // Values from your documents
  values = [
    { 
      title: 'Trust', 
      desc: 'Building a safe and secure platform for our users.', 
      icon: this.faShield 
    },
    { 
      title: 'Community', 
      desc: 'Connecting people and fostering local economies.', 
      icon: this.faUsers 
    },
    { 
      title: 'Innovation', 
      desc: 'Continuously improving the experience for everyone.', 
      icon: this.faLightbulb 
    }
  ];
}