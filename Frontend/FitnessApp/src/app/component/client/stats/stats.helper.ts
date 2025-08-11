import { Injectable } from '@angular/core';
import { ChartConfiguration } from 'chart.js';
import { ProgressImages } from '../../../models/ProgressImages';

@Injectable({ providedIn: 'root' })
export class StatsHelperService {
  emptyLineChart(): ChartConfiguration<'line'>['data'] {
    return { labels: [], datasets: [] };
  }

  emptyBarChart(): ChartConfiguration<'bar'>['data'] {
    return { labels: [], datasets: [] };
  }

  setupWeightHeightChart(images: any[], view: 'daily' | 'weekly' | 'monthly') {
    const sorted = [...images].sort(
      (a, b) => new Date(a.uploadedAt).getTime() - new Date(b.uploadedAt).getTime()
    );

    const grouped = this.groupByTimeRange(sorted, view);

    return {
      labels: grouped.map(g => g.label),
      datasets: [
        {
          data: grouped.map(g => g.avgWeight),
          label: 'Weight (kg)',
          borderColor: 'blue',
          fill: false,
        },
        {
          data: grouped.map(g => g.avgHeight),
          label: 'Height (cm)',
          borderColor: 'green',
          fill: false,
        },
      ],
    };
  }

  setupPlanProgressChart(assigns: any[]) {
    return {
      labels: assigns.map((_, i) => `Plan ${i + 1}`),
      datasets: [
        {
          label: 'Progress %',
          data: assigns.map((a) => a.progressPercentage),
          backgroundColor: 'rgba(54, 162, 235, 0.6)',
        },
      ],
    };
  }

  setupCaloriesChart(assigns: any[]) {
    const filtered = assigns.filter((a) => a.caloriesIntake && a.caloriesBurnt);

    return {
      labels: filtered.map((_, i) => `Plan ${i + 1}`),
      datasets: [
        {
          label: 'Calories Intake',
          data: filtered.map((a) => a.caloriesIntake),
        },
        {
          label: 'Calories Burnt',
          data: filtered.map((a) => a.caloriesBurnt),
          backgroundColor: 'red',
        },
      ],
    };
  }

  setupCalorieLineChart(assigns: any[]) {
    let totalIntake = 0, totalBurnt = 0, intakeCount = 0, burntCount = 0;

    for (const assign of assigns) {
      const entries = assign.submittedOn?.$values;
      if (!Array.isArray(entries)) continue;

      for (const entry of entries) {
        const intake = Number(entry.caloriesIntake || 0);
        const burnt = Number(entry.caloriesBurnt || 0);

        if (intake > 0) {
          totalIntake += intake;
          intakeCount++;
        }
        if (burnt > 0) {
          totalBurnt += burnt;
          burntCount++;
        }
      }
    }

    const avgIntake = intakeCount > 0 ? totalIntake / intakeCount : 0;
    const avgBurnt = burntCount > 0 ? totalBurnt / burntCount : 0;

    return {
      labels: ['Avg Calories Intake', 'Avg Calories Burnt'],
      datasets: [
        {
          data: [avgIntake, avgBurnt],
          backgroundColor: ['orange', 'red'],
          label: 'Calories Distribution',
        },
      ],
    };
  }

  groupByTimeRange(images: any[], view: 'daily' | 'weekly' | 'monthly') {
    const result: { label: string; avgWeight: number; avgHeight: number }[] = [];

    const groupBy = (fn: (d: Date) => string) => {
      const map = new Map<string, any[]>();
      for (const img of images) {
        const key = fn(new Date(img.uploadedAt));
        if (!map.has(key)) map.set(key, []);
        map.get(key)!.push(img);
      }
      for (const [key, group] of map) {
        result.push({
          label: key,
          avgWeight: group.reduce((s, g) => s + g.weight, 0) / group.length,
          avgHeight: group.reduce((s, g) => s + g.height, 0) / group.length,
        });
      }
    };

    if (view === 'daily') {
      groupBy(d=> d.toISOString().split('T')[0]);
    } 
    else if(view === 'monthly'){
      groupBy(d => d.toLocaleDateString('en-IN', {year: 'numeric', month: 'long'}))
    }
    else {
      const sortedImages = [...images].sort((a, b) => new Date(a.uploadedAt).getTime() - new Date(b.uploadedAt).getTime());
      const startDate = new Date(sortedImages[0].uploadedAt);

      const weekGroups: { [weekLabel: string]: ProgressImages[] } = {};

      for (const img of sortedImages) {
        const imgDate = new Date(img.uploadedAt);
        const daysDiff = Math.floor((imgDate.getTime() - startDate.getTime()) / (24 * 60 * 60 * 1000));
        const weekNum = Math.floor(daysDiff / 7);

        // Shift start and end dates based on weekNum
        const weekStart = new Date(startDate);
        weekStart.setDate(weekStart.getDate() + (weekNum * 7));

        const weekEnd = new Date(weekStart);
        weekEnd.setDate(weekStart.getDate() + 6);

        const label = `Week ${weekNum + 1} (${weekStart.toLocaleDateString('en-IN', { month: 'short', day: 'numeric' })} - ${weekEnd.toLocaleDateString('en-IN', { month: 'short', day: 'numeric' })})`;

        if (!weekGroups[label]) weekGroups[label] = [];
        weekGroups[label].push(img);
      }

      for (const [label, group] of Object.entries(weekGroups)) {
        result.push({
          label,
          avgWeight: group.reduce((s, g) => s + g.weight, 0) / group.length,
          avgHeight: group.reduce((s, g) => s + g.height, 0) / group.length
        });
      }
    }

    return result;
  }

  groupImagesByTimeFrame(images: any[], grouping: 'weekly' | 'monthly') {
  const groupedMap = new Map<string, any>();
  const usedImageIds = new Set<string>();

  const intervalDays = grouping === 'weekly' ? 7 : 30;

  const sortedImages = [...images].sort((a, b) =>
    new Date(b.uploadedAt).getTime() - new Date(a.uploadedAt).getTime()
  );

  let referenceDate = new Date(sortedImages[0].uploadedAt);
  referenceDate.setHours(0, 0, 0, 0);

  while (true) {
    const start = new Date(referenceDate);
    start.setDate(start.getDate() - intervalDays + 1);
    const end = new Date(referenceDate);

    const windowImages = sortedImages.filter(img => {
      if (usedImageIds.has(img.id)) return false;
      const d = new Date(img.uploadedAt);
      d.setHours(0, 0, 0, 0);
      return d >= start && d <= end;
    });

    if (windowImages.length === 0) 
      break;

    const latestImage = windowImages.reduce((latest, current) =>
      new Date(current.uploadedAt) > new Date(latest.uploadedAt) ? current : latest
    );

    usedImageIds.add(latestImage.id);

    const label =
      grouping === 'weekly'
        ? `Week ${Math.ceil((images.length - groupedMap.size))} (${start.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}–${end.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })})`
        : `${end.toLocaleString('default', { month: 'short' })} ${end.getFullYear()}`;

    groupedMap.set(label, { ...latestImage, groupLabel: label });

    referenceDate.setDate(referenceDate.getDate() - intervalDays);
  }

  return Array.from(groupedMap.values());
}


  
}
