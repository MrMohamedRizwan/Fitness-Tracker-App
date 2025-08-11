import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ProgressImages } from '../../../models/ProgressImages';

@Component({
  selector: 'app-stats-photos',
  imports: [CommonModule, FormsModule],
  templateUrl: './stats-photos.html',
  styleUrl: './stats-photos.css'
})
export class StatsPhotos {
  @Input() proImages: ProgressImages[] = [];
  @Input() groupedImages: ProgressImages[] = [];
  @Input() selectedGrouping: 'weekly' | 'monthly' = 'weekly';
  @Input() showComparison: boolean = false;
  @Input() showGallery: boolean = false;
  @Input() groupImagesByTimeFrame!: (grouping: 'weekly' | 'monthly') => void;
}
