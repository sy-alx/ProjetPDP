import { TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { Router } from '@angular/router';
import { AuthGuard } from './auth.guard';

describe('AuthGuard', () => {
  let guard: AuthGuard;
  let router: Router;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [RouterTestingModule],
      providers: [AuthGuard]
    });
    guard = TestBed.inject(AuthGuard);
    router = TestBed.inject(Router);
  });

  it('should be created', () => {
    expect(guard).toBeTruthy();
  });

  it('should allow navigation when token is present', () => {
    localStorage.setItem('token', 'example-token');
    const canActivate = guard.canActivate({} as any, {} as any);
    expect(canActivate).toBe(true);
  });

  it('should redirect to login page when token is not present', () => {
    localStorage.removeItem('token');
    spyOn(router, 'navigate');
    const canActivate = guard.canActivate({} as any, {} as any);
    expect(canActivate).toBe(false);
    expect(router.navigate).toHaveBeenCalledWith(['/login']);
  });
});
