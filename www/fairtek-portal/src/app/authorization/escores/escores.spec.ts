import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { EscoresComponent } from './escores';

describe('EscoresComponent', () => {
  let component: EscoresComponent;
  let fixture: ComponentFixture<EscoresComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ EscoresComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(EscoresComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
