import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-quotes',
  imports: [],
  templateUrl: './quotes.html',
  styleUrl: './quotes.css',
})
export class Quotes implements OnInit {
  motivationalQuotes: string[] = [
    'Push yourself, because no one else is going to do it for you.',
    'The body achieves what the mind believes.',
    'No pain, no gain. Shut up and train.',
    'Your only limit is you.',
    'Train insane or remain the same.',
    'Results happen over time, not overnight. Work hard, stay consistent.',
    "Fitness is not about being better than someone else. It's about being better than you used to be.",
    'You don’t have to be extreme, just consistent.',
    'Sweat is just fat crying.',
    'Wake up. Work out. Look hot. Kick ass.',
    'When you feel like quitting, think about why you started.',
    'If it doesn’t challenge you, it won’t change you.',
    'Strive for progress, not perfection.',
    'You are stronger than you think.',
    'Success starts with self-discipline.',
    'Discipline is the bridge between goals and accomplishment.',
    'Don’t limit your challenges. Challenge your limits.',
    'It’s going to be a journey. It’s not a sprint to get in shape.',
    'Make your body the sexiest outfit you own.',
    'You don’t find willpower, you create it.',
    'Excuses don’t burn calories.',
    'The only bad workout is the one that didn’t happen.',
    'It never gets easier, you just get stronger.',
    'Your future self will thank you for the work you do today.',
    'One workout at a time, one day at a time.',
    'Strong is not just physical. It’s a mindset.',
    'The difference between try and triumph is a little ‘umph’!',
    'Fitness is like a relationship. You can’t cheat and expect it to work.',
    'Fall in love with taking care of yourself.',
  ];

  selectedQuote: string = '';

  ngOnInit(): void {
    const randomIndex = Math.floor(
      Math.random() * this.motivationalQuotes.length
    );
    this.selectedQuote = this.motivationalQuotes[randomIndex];
  }
}
