import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';

// Landing comercial en "/". Texto genérico por ahora.
@Component({
  selector: 'app-landing',
  imports: [RouterLink],
  templateUrl: './landing.component.html',
  styleUrl: './landing.component.css'
})
export class LandingComponent {
  // Alias con reenvío a mi mail personal (ImprovMX), no expone el real.
  contactoEmail = 'contacto@tumenuapp.com';
}
