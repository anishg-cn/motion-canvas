import { decorate, threadable } from '../decorators';
import { useThread } from '../utils';
decorate(tween, threadable());
export function* tween(seconds, onProgress, onEnd) {
    const thread = useThread();
    const startTime = thread.time();
    const endTime = thread.time() + seconds;
    onProgress(0, 0);
    while (endTime > thread.fixed) {
        const time = thread.fixed - startTime;
        const value = time / seconds;
        if (time > 0) {
            onProgress(value, time);
        }
        yield;
    }
    thread.time(endTime);
    onProgress(1, seconds);
    onEnd?.(1, seconds);
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidHdlZW4uanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi9zcmMvdHdlZW5pbmcvdHdlZW4udHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUEsT0FBTyxFQUFDLFFBQVEsRUFBRSxVQUFVLEVBQUMsTUFBTSxlQUFlLENBQUM7QUFFbkQsT0FBTyxFQUFDLFNBQVMsRUFBQyxNQUFNLFVBQVUsQ0FBQztBQUVuQyxRQUFRLENBQUMsS0FBSyxFQUFFLFVBQVUsRUFBRSxDQUFDLENBQUM7QUFDOUIsTUFBTSxTQUFTLENBQUMsQ0FBQyxLQUFLLENBQ3BCLE9BQWUsRUFDZixVQUFpRCxFQUNqRCxLQUE2QztJQUU3QyxNQUFNLE1BQU0sR0FBRyxTQUFTLEVBQUUsQ0FBQztJQUUzQixNQUFNLFNBQVMsR0FBRyxNQUFNLENBQUMsSUFBSSxFQUFFLENBQUM7SUFDaEMsTUFBTSxPQUFPLEdBQUcsTUFBTSxDQUFDLElBQUksRUFBRSxHQUFHLE9BQU8sQ0FBQztJQUV4QyxVQUFVLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDO0lBQ2pCLE9BQU8sT0FBTyxHQUFHLE1BQU0sQ0FBQyxLQUFLLEVBQUU7UUFDN0IsTUFBTSxJQUFJLEdBQUcsTUFBTSxDQUFDLEtBQUssR0FBRyxTQUFTLENBQUM7UUFDdEMsTUFBTSxLQUFLLEdBQUcsSUFBSSxHQUFHLE9BQU8sQ0FBQztRQUM3QixJQUFJLElBQUksR0FBRyxDQUFDLEVBQUU7WUFDWixVQUFVLENBQUMsS0FBSyxFQUFFLElBQUksQ0FBQyxDQUFDO1NBQ3pCO1FBQ0QsS0FBSyxDQUFDO0tBQ1A7SUFDRCxNQUFNLENBQUMsSUFBSSxDQUFDLE9BQU8sQ0FBQyxDQUFDO0lBRXJCLFVBQVUsQ0FBQyxDQUFDLEVBQUUsT0FBTyxDQUFDLENBQUM7SUFDdkIsS0FBSyxFQUFFLENBQUMsQ0FBQyxFQUFFLE9BQU8sQ0FBQyxDQUFDO0FBQ3RCLENBQUMifQ==