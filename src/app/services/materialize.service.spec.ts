import { TestBed, inject } from '@angular/core/testing';

import { MaterializeService } from './materialize.service';

describe('MaterializeService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [MaterializeService]
    });
  });

  it('should be created', inject([MaterializeService], (service: MaterializeService) => {
    expect(service).toBeTruthy();
  }));
});
